# Google Forms Integration Setup Guide

## Step 1: Create Your Google Form

1. **Go to Google Forms**: Visit [forms.google.com](https://forms.google.com)
2. **Create a New Form**: Click "Blank" or use a template
3. **Design Your Form**: Add questions, sections, and settings

### Sample Night Market Vendor Application Form:

**Form Title**: Night Market Vendor Application - MAS Queens

**Questions to Include**:
1. **Business Information**
   - Business Name (Text)
   - Contact Person Name (Text) 
   - Email Address (Email)
   - Phone Number (Text)
   - Business Type (Multiple choice: Food, Crafts, Retail, Services, Other)

2. **Product Details**
   - Describe your products/services (Paragraph)
   - Upload product photos (File upload)
   - Price range of items (Text)

3. **Requirements**
   - Do you have a business license? (Yes/No)
   - Do you have liability insurance? (Yes/No)
   - Food handler's permit (if food vendor) (File upload)

4. **Event Details**
   - Available dates (Checkboxes)
   - Booth size preference (Multiple choice: Small, Medium, Large)
   - Power requirements (Yes/No)
   - Special requests (Paragraph)

5. **Agreement**
   - I agree to the vendor terms and conditions (Checkbox - Required)

## Step 2: Get the Form URLs

### Method 1: Get Embed URL
1. Click "Send" button in your form
2. Click the "Embed" tab (< > icon)
3. Copy the URL from the iframe src attribute
4. Example: `https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform?embedded=true`

### Method 2: Get Direct URL
1. Click "Send" button in your form  
2. Click the "Link" tab (🔗 icon)
3. Copy the shortened URL
4. Example: `https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform`

## Step 3: Update Your Website

Replace the placeholder URLs in these files:

### File: `/src/app/forms/page.tsx`
```typescript
// Line ~15 - Update vendor application URLs
googleFormUrl: 'YOUR_DIRECT_FORM_URL_HERE',
embedUrl: 'YOUR_EMBED_FORM_URL_HERE',
```

### File: `/src/app/forms/[slug]/page.tsx`
```typescript
// Line ~15 - Update vendor application URLs
embedUrl: 'YOUR_EMBED_FORM_URL_HERE',
googleFormUrl: 'YOUR_DIRECT_FORM_URL_HERE',
```

## Step 4: View Form Responses

1. **In Google Forms**: Click "Responses" tab to view submissions
2. **Export to Sheets**: Click the Google Sheets icon to create a spreadsheet
3. **Get Notifications**: Go to form settings and enable email notifications

## Adding More Forms

To add additional forms (feedback, rentals, etc.):

1. Create the new Google Form
2. Get the URLs as described above
3. Add a new entry to the `formData` object in both files:

```typescript
'new-form-slug': {
  title: 'Your Form Title',
  description: 'Form description',
  embedUrl: 'YOUR_EMBED_URL',
  googleFormUrl: 'YOUR_DIRECT_URL',
  deadline: '2025-08-01', // or null
  instructions: ['Step 1', 'Step 2'],
  requirements: ['Requirement 1', 'Requirement 2'] // or null
}
```

4. Add the form to the `availableForms` array in `/src/app/forms/page.tsx`

## Form Settings Recommendations

### Security Settings:
- ✅ Limit to 1 response per person (if needed)
- ✅ Require sign-in (optional, for accountability)
- ✅ Enable email notifications for new responses

### Response Settings:
- ✅ Show confirmation message after submission
- ✅ Enable response editing (if appropriate)
- ✅ Send respondent a copy of their response

### Advanced Settings:
- ✅ Set response deadline (if needed)
- ✅ Close form automatically when deadline reached
- ✅ Customize confirmation message

## Sample Confirmation Message:

"Jazakallahu Khayran! Your vendor application has been received. We will review your submission and contact you within 3-5 business days. If you have any questions, please contact us at info@masqueens.org or (718) 606-6025."

## Monitoring and Management

### Weekly Tasks:
- Check for new form responses
- Respond to applications within promised timeframe
- Update form status (open/closed) as needed

### Before Events:
- Set application deadlines
- Close forms when capacity reached
- Send confirmation emails to selected vendors

## Troubleshooting

**Form not displaying?**
- Check that the embed URL is correct
- Ensure the form is set to "public" or "anyone with link"
- Try the direct URL instead

**Styling issues?**
- Google Forms inherit some styles from the parent page
- The iframe height can be adjusted in the code
- Forms are responsive by default

## Future Enhancements

This Google Forms integration is the foundation. Future improvements could include:
- Custom form builder in admin panel
- Automatic response processing
- Integration with your user database
- Payment processing for paid applications
- Advanced approval workflows

For now, this gives you immediate capability to collect vendor applications and other form submissions professionally!