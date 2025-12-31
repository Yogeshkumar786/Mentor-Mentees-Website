#!/usr/bin/env python
"""
Fix department/branch names to use CSE, ECE, EEE consistently
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentormentee.settings')
django.setup()

from core.models import Student, Faculty, HOD, Mentorship

# Define mapping for departments
DEPARTMENTS = ['CSE', 'ECE', 'EEE']

def fix_departments():
    print("Fixing department/branch names...")
    
    # Get counts
    student_count = Student.objects.count()
    faculty_count = Faculty.objects.count()
    hod_count = HOD.objects.count()
    
    print(f"\nTotal Students: {student_count}")
    print(f"Total Faculty: {faculty_count}")
    print(f"Total HODs: {hod_count}")
    
    # Update Students - distribute evenly across departments
    students = list(Student.objects.all())
    for i, student in enumerate(students):
        dept = DEPARTMENTS[i % len(DEPARTMENTS)]
        student.branch = dept
        student.save()
    print(f"\nUpdated {len(students)} students with branches: CSE, ECE, EEE")
    
    # Update Faculty - distribute evenly across departments
    faculty_list = list(Faculty.objects.all())
    for i, faculty in enumerate(faculty_list):
        dept = DEPARTMENTS[i % len(DEPARTMENTS)]
        faculty.department = dept
        faculty.save()
    print(f"Updated {len(faculty_list)} faculty with departments: CSE, ECE, EEE")
    
    # Update HODs - one per department
    hods = list(HOD.objects.all())
    for i, hod in enumerate(hods):
        if i < len(DEPARTMENTS):
            dept = DEPARTMENTS[i]
            hod.department = dept
            # Also update the faculty's department to match
            hod.faculty.department = dept
            hod.faculty.save()
            hod.save()
    print(f"Updated {len(hods)} HODs with departments: {DEPARTMENTS[:len(hods)]}")
    
    # Update Mentorships - use raw SQL to avoid model field issues
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            # Update mentorship departments based on faculty
            cursor.execute("""
                UPDATE mentorships m
                SET department = f.department
                FROM faculty f
                WHERE m."facultyId" = f.id
            """)
            print(f"Updated mentorships departments")
    except Exception as e:
        print(f"Skipped mentorships update: {e}")
    
    # Print summary
    print("\n=== Summary ===")
    print("\nStudents by branch:")
    for dept in DEPARTMENTS:
        count = Student.objects.filter(branch=dept).count()
        print(f"  {dept}: {count}")
    
    print("\nFaculty by department:")
    for dept in DEPARTMENTS:
        count = Faculty.objects.filter(department=dept).count()
        print(f"  {dept}: {count}")
    
    print("\nHODs by department:")
    for dept in DEPARTMENTS:
        count = HOD.objects.filter(department=dept).count()
        print(f"  {dept}: {count}")

if __name__ == '__main__':
    fix_departments()
    print("\nDone!")
