"""
URL configuration for mentormentee project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/hod/assign-mentor', views.assign_mentor, name='assign_mentor'),
    path('api/hod/schedule-meetings', views.schedule_meetings, name='schedule_meetings'),
    path('api/hod/schedule-group-meetings', views.schedule_group_meetings, name='schedule_group_meetings'),
    path('api/hod/mentorships', views.get_hod_mentorships, name='get_hod_mentorships'),
    path('api/hod/mentorship/group', views.get_mentorship_group, name='get_mentorship_group'),
    path('api/hod/mentorship/<uuid:mentorship_id>', views.get_mentorship_details, name='get_mentorship_details'),
    path('api/hod/mentorship/<uuid:mentorship_id>/end', views.end_mentorship, name='end_mentorship'),
    path('api/hod/meeting/create', views.create_mentorship_meeting, name='create_mentorship_meeting'),
    path('api/department/students', views.get_department_students, name='get_department_students'),
    path('api/faculty', views.get_faculty, name='get_faculty'),
    # Faculty Mentorship APIs
    path('api/faculty/mentees', views.get_faculty_mentees, name='get_faculty_mentees'),
    path('api/faculty/mentorship/group', views.get_faculty_mentorship_group, name='get_faculty_mentorship_group'),
    path('api/faculty/schedule-meetings', views.faculty_schedule_meetings, name='faculty_schedule_meetings'),
    path('api/faculty/schedule-group-meetings', views.faculty_schedule_group_meetings, name='faculty_schedule_group_meetings'),
    path('api/student/mentor-details', views.get_student_mentor_details, name='get_student_mentor_details'),
    # HOD Management APIs (Admin only)
    path('api/hods', views.get_hods, name='get_hods'),
    path('api/hod/assign', views.assign_hod, name='assign_hod'),
    path('api/hod/<uuid:hod_id>/remove', views.remove_hod, name='remove_hod'),
    path('api/hod/change', views.change_hod, name='change_hod'),
    # Faculty Management APIs (Admin only)
    path('api/admin/faculty', views.create_faculty, name='create_faculty'),
    path('api/admin/faculty/<uuid:faculty_id>', views.update_faculty, name='update_faculty'),
    # Student APIs
    path('api/student/about', views.get_student_about, name='get_student_about'),
    path('api/student/career-details', views.get_student_career_details, name='get_student_career_details'),
    path('api/student/internships', views.get_student_internships, name='get_student_internships'),
    path('api/student/personal-problems', views.get_student_personal_problems, name='get_student_personal_problems'),
    path('api/student/projects', views.get_student_projects, name='get_student_projects'),
    path('api/student/academic', views.get_student_academic, name='get_student_academic'),
    # Meeting completion APIs
    path('api/meeting/<uuid:meeting_id>/complete', views.complete_meeting, name='complete_meeting'),
    path('api/meetings/complete-group', views.complete_group_meetings, name='complete_group_meetings'),
    # Request APIs - Student
    path('api/student/requests', views.get_student_requests, name='get_student_requests'),
    path('api/student/internships/request', views.create_internship_request, name='create_internship_request'),
    path('api/student/projects/request', views.create_project_request, name='create_project_request'),
    # Request APIs - Faculty/HOD
    path('api/faculty/requests/pending', views.get_pending_requests, name='get_pending_requests'),
    path('api/requests/<uuid:request_id>/approve', views.approve_request, name='approve_request'),
    path('api/requests/<uuid:request_id>/reject', views.reject_request, name='reject_request'),
    # Mentor APIs - Student
    path('api/student/mentors', views.get_student_mentors, name='get_student_mentors'),
    path('api/student/mentorship/<uuid:mentorship_id>/meetings', views.get_mentorship_meetings, name='get_mentorship_meetings'),
    # Student Update APIs
    path('api/student/personal-problems/update', views.update_personal_problems, name='update_personal_problems'),
    path('api/student/career-details/update', views.update_career_details_all, name='update_career_details_all'),
    path('api/student/career-details/hobbies', views.update_career_hobbies, name='update_career_hobbies'),
    path('api/student/career-details/strengths', views.update_career_strengths, name='update_career_strengths'),
    path('api/student/career-details/areas-to-improve', views.update_career_areas_to_improve, name='update_career_areas_to_improve'),
    path('api/student/career-details/core', views.update_career_core, name='update_career_core'),
    path('api/student/career-details/it', views.update_career_it, name='update_career_it'),
    path('api/student/career-details/higher-education', views.update_career_higher_education, name='update_career_higher_education'),
    path('api/student/career-details/startup', views.update_career_startup, name='update_career_startup'),
    path('api/student/career-details/family-business', views.update_career_family_business, name='update_career_family_business'),
    path('api/student/career-details/other-interests', views.update_career_other_interests, name='update_career_other_interests'),
    # Request Management APIs
    path('api/student/requests/<uuid:request_id>/cancel', views.cancel_request, name='cancel_request'),
    path('api/student/internships/delete-request', views.create_delete_internship_request, name='create_delete_internship_request'),
    path('api/student/projects/delete-request', views.create_delete_project_request, name='create_delete_project_request'),
    path('api/student/meeting/request', views.create_meeting_request, name='create_meeting_request'),
]
