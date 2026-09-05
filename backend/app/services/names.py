import hashlib
from typing import Optional

INDIAN_FEMALE = [
    "Ananya Sharma", "Priya Iyer", "Kavya Reddy", "Meera Nair", "Sneha Patel",
    "Aisha Khan", "Diya Menon", "Pooja Desai", "Riya Gupta", "Lakshmi Rao",
    "Nisha Bansal", "Shreya Kulkarni", "Ishita Joshi", "Aditi Verma", "Neha Kapoor",
    "Tanvi Shah", "Kritika Singh", "Anjali Pillai", "Sana Qureshi", "Divya Rajan",
]

INDIAN_MALE = [
    "Arjun Mehta", "Rohan Kapoor", "Vikram Singh", "Aditya Nair", "Karan Malhotra",
    "Rahul Verma", "Aman Joshi", "Nikhil Shah", "Siddharth Reddy", "Ayaan Khan",
    "Harsh Patel", "Kunal Desai", "Varun Iyer", "Manish Gupta", "Rohit Sharma",
    "Abhishek Rao", "Pranav Menon", "Yash Kulkarni", "Dev Bansal", "Saurabh Pillai",
]

INTL_FEMALE = [
    "Emma Wilson", "Sophia Martinez", "Olivia Bennett", "Mia Rossi", "Hana Suzuki",
    "Fatima Al-Sayed", "Chloe Dubois", "Elena Petrova", "Amina Diallo", "Grace Thompson",
]

INTL_MALE = [
    "James Carter", "Liam O'Connor", "Daniel Kim", "Wei Chen", "Marcus Johansson",
    "Omar Hassan", "Lucas Silva", "Noah Müller", "Ethan Brooks", "David Cohen",
]


def generate_patient_name(patient_code: str, gender: Optional[str] = None) -> str:
    """Deterministic name from patient ID so the same ID always maps to the same person."""
    seed = int(hashlib.md5(str(patient_code).encode("utf-8")).hexdigest(), 16)
    gender_key = (gender or "").strip().lower()
    indian = seed % 10 < 7

    if gender_key in ("female", "f"):
        pool = INDIAN_FEMALE if indian else INTL_FEMALE
    elif gender_key in ("male", "m"):
        pool = INDIAN_MALE if indian else INTL_MALE
    else:
        pool = (INDIAN_FEMALE + INDIAN_MALE) if indian else (INTL_FEMALE + INTL_MALE)

    return pool[seed % len(pool)]
