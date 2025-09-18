#!/usr/bin/env python3

import ollama
import json

def test_sql_generation():
    """Test if qwen2.5:3b can generate SQL for our use cases"""

    model = "qwen2.5:3b"

    # Database schema context
    schema_context = """
Database Schema:
- events table: id, title, description, date, time, location, category, status, volunteers_needed
- volunteer_profiles table: id, user_id, status, skills, availability
- users table: id, first_name, last_name, email, phone
- volunteer_signups table: id, user_id, event_id, created_at
- event_rsvps table: id, user_id, event_id, created_at

Rules:
- Only show active events (status = 'active')
- Dates should be >= date('now') for upcoming events
- Always use proper SQLite syntax
"""

    test_cases = [
        {
            "query": "Show me upcoming events",
            "expected_elements": ["SELECT", "FROM events", "WHERE", "status = 'active'", "date >= date('now')"]
        },
        {
            "query": "Find events from last month with good attendance",
            "expected_elements": ["LEFT JOIN event_rsvps", "COUNT", "GROUP BY", "HAVING"]
        },
        {
            "query": "Get volunteers who know event planning",
            "expected_elements": ["volunteer_profiles", "volunteer_tags", "JOIN"]
        },
        {
            "query": "Show me religious events happening this week",
            "expected_elements": ["category", "LIKE", "date >=", "date <"]
        }
    ]

    results = []

    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*50}")
        print(f"Test {i}: {test['query']}")
        print('='*50)

        prompt = f"""{schema_context}

User Request: "{test['query']}"

Generate a SQLite query for this request. Return ONLY the SQL query, no explanations.

SQL:"""

        try:
            response = ollama.chat(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                options={"temperature": 0.1}  # Low temperature for more consistent code
            )

            sql_response = response['message']['content'].strip()

            # Clean up response (remove markdown if present)
            if "```sql" in sql_response:
                sql_response = sql_response.split("```sql")[1].split("```")[0].strip()
            elif "```" in sql_response:
                sql_response = sql_response.split("```")[1].split("```")[0].strip()

            print(f"Generated SQL:\n{sql_response}")

            # Check if expected elements are present
            found_elements = []
            missing_elements = []

            for element in test['expected_elements']:
                if element.lower() in sql_response.lower():
                    found_elements.append(element)
                else:
                    missing_elements.append(element)

            print(f"\n✅ Found: {found_elements}")
            if missing_elements:
                print(f"❌ Missing: {missing_elements}")

            # Basic SQL syntax check
            has_select = "select" in sql_response.lower()
            has_from = "from" in sql_response.lower()
            has_semicolon = sql_response.strip().endswith(';')

            results.append({
                "test": test['query'],
                "sql": sql_response,
                "found_elements": found_elements,
                "missing_elements": missing_elements,
                "basic_syntax": has_select and has_from,
                "score": len(found_elements) / len(test['expected_elements']) * 100
            })

        except Exception as e:
            print(f"❌ Error: {e}")
            results.append({
                "test": test['query'],
                "error": str(e),
                "score": 0
            })

    # Summary
    print(f"\n{'='*50}")
    print("SUMMARY")
    print('='*50)

    total_score = sum(r.get('score', 0) for r in results)
    avg_score = total_score / len(results)

    print(f"Average Score: {avg_score:.1f}%")

    for i, result in enumerate(results, 1):
        if 'error' not in result:
            print(f"Test {i}: {result['score']:.1f}% - {result['test']}")
        else:
            print(f"Test {i}: ERROR - {result['test']}")

    if avg_score >= 70:
        print("\n🎉 qwen2.5:3b looks good for SQL generation!")
        print("Recommendation: Use it for dynamic queries")
    elif avg_score >= 50:
        print("\n⚠️  qwen2.5:3b is okay but might need prompt engineering")
        print("Recommendation: Use with careful validation")
    else:
        print("\n❌ qwen2.5:3b struggles with SQL generation")
        print("Recommendation: Stick with hardcoded queries or use a better model")

if __name__ == "__main__":
    test_sql_generation()