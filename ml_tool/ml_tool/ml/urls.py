from django.urls import path
from . import views

urlpatterns = [
    path('', views.home),
    path('health/', views.health_check),
    path('projects/<int:project_id>/step2/summary/', views.step2_summary),
    path('projects/<int:project_id>/column-mapper/save/', views.column_mapper_save),
    path('projects/<int:project_id>/step3/apply/', views.step3_apply),
]