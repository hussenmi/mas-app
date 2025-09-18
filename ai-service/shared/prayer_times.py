#!/usr/bin/env python3
"""
Shared prayer times functionality for MAS Queens AI Service
"""

import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from hijri_converter import Hijri, Gregorian

logger = logging.getLogger(__name__)

def get_prayer_times(date: str = None) -> Dict[str, Any]:
    """Get prayer times for specific date using Aladhan API"""
    try:
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        # Parse the date
        target_date = datetime.strptime(date, "%Y-%m-%d")

        # MAS Queens address
        address = "89-89 168th St, Jamaica, NY 11432"

        # Aladhan API call
        response = requests.get(
            "http://api.aladhan.com/v1/timingsByAddress",
            params={
                "address": address,
                "method": 2,  # ISNA method
                "date": target_date.strftime("%d-%m-%Y")
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            timings = data["data"]["timings"]

            # Convert to 12-hour format
            def convert_time(time_24):
                time_obj = datetime.strptime(time_24.split()[0], "%H:%M")
                return time_obj.strftime("%I:%M %p").lstrip("0")

            # Calculate Iqama times (10 minutes after Adhan, except Maghrib which is 5 minutes)
            def get_iqama_time(adhan_time, delay_minutes=10):
                time_obj = datetime.strptime(adhan_time.split()[0], "%H:%M")
                iqama_time = time_obj + timedelta(minutes=delay_minutes)
                return iqama_time.strftime("%I:%M %p").lstrip("0")

            # Get Hijri date
            gregorian_date = Gregorian(target_date.year, target_date.month, target_date.day)
            hijri_date = gregorian_date.to_hijri()

            return {
                "date": date,
                "hijri_date": f"{hijri_date.day} {hijri_date.month_name()} {hijri_date.year} AH",
                "fajr": convert_time(timings["Fajr"]),
                "fajr_iqama": get_iqama_time(timings["Fajr"], 20),  # 20 min for Fajr
                "sunrise": convert_time(timings["Sunrise"]),
                "dhuhr": convert_time(timings["Dhuhr"]),
                "dhuhr_iqama": get_iqama_time(timings["Dhuhr"], 10),
                "asr": convert_time(timings["Asr"]),
                "asr_iqama": get_iqama_time(timings["Asr"], 10),
                "maghrib": convert_time(timings["Maghrib"]),
                "maghrib_iqama": get_iqama_time(timings["Maghrib"], 5),  # 5 min for Maghrib
                "isha": convert_time(timings["Isha"]),
                "isha_iqama": get_iqama_time(timings["Isha"], 10)
            }

    except Exception as e:
        logger.error(f"Error fetching prayer times: {e}")
        return {
            "error": "Unable to fetch prayer times",
            "date": date or datetime.now().strftime("%Y-%m-%d")
        }