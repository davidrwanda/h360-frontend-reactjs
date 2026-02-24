import type { Dictionary } from '../../types';

export const serviceEn: Dictionary = {
  // Page header
  'service.services_management': 'Services Management',
  'service.manage_clinic_services': 'Manage services for your clinic',
  'service.create_service': 'Create Service',
  'service.create_new_service': 'Create New Service',
  'service.add_service_desc': 'Add a new service to the clinic',
  'service.edit_service': 'Edit Service',
  'service.update_service_info': 'Update service information',
  'service.service_details': 'Service Details',

  // Filters
  'service.filters': 'Filters',
  'service.show_advanced': 'Show Advanced',
  'service.hide_advanced': 'Hide Advanced',
  'service.search': 'Search',
  'service.search_placeholder': 'Search by name or code...',
  'service.status': 'Status',
  'service.all_status': 'All Status',
  'service.active': 'Active',
  'service.inactive': 'Inactive',
  'service.category': 'Category',
  'service.category_placeholder': 'Filter by category',
  'service.requires_appointment': 'Requires Appointment',
  'service.all': 'All',
  'service.yes': 'Yes',
  'service.no': 'No',
  'service.clear_filters': 'Clear',

  // Table
  'service.service_code': 'Service Code',
  'service.name': 'Name',
  'service.price': 'Price',
  'service.duration': 'Duration',
  'service.duration_min': '{{minutes}} min',
  'service.actions': 'Actions',
  'service.no_services_found': 'No services found',
  'service.failed_to_load': 'Failed to load services',
  'service.activate_service_tooltip': 'Activate service',

  // Pagination
  'service.page_of': 'Page {{page}} of {{totalPages}}',
  'service.previous': 'Previous',
  'service.next': 'Next',

  // Deactivate/Activate modals
  'service.deactivate_title': 'Deactivate Service',
  'service.deactivate_message': 'Are you sure you want to deactivate "{{name}}"? This action can be undone later.',
  'service.deactivate': 'Deactivate',
  'service.activate_title': 'Activate Service',
  'service.activate_message': 'Are you sure you want to activate "{{name}}"?',
  'service.activate': 'Activate',

  // Detail page
  'service.service_information': 'Service Information',
  'service.service_not_found': 'Service Not Found',
  'service.service_not_found_desc': "The service you're looking for doesn't exist or has been removed.",
  'service.back': 'Back',
  'service.clinic': 'Clinic',
  'service.max_daily_capacity': 'Max Daily Capacity',
  'service.appointment_type': 'Appointment Type',
  'service.requires_appointment_label': 'Requires Appointment',
  'service.walk_in_available': 'Walk-in Available',
  'service.description': 'Description',
  'service.assigned_doctors': 'Assigned Doctors',
  'service.unknown_doctor': 'Unknown Doctor',
  'service.custom_price': 'Custom price',
  'service.custom_duration': 'Custom duration',

  // Create/Edit form
  'service.service_name': 'Service Name',
  'service.service_name_placeholder': 'Enter service name',
  'service.service_name_required': 'Service name is required',
  'service.service_code_label': 'Service Code',
  'service.service_code_placeholder': 'Enter service code',
  'service.service_code_required': 'Service code is required',
  'service.description_placeholder': 'Enter service description',
  'service.category_select_placeholder': 'Select or type a category',
  'service.price_placeholder': 'Enter price',
  'service.price_required': 'Price must be a positive number',
  'service.duration_label': 'Duration (minutes)',
  'service.duration_min_error': 'Duration must be at least 1 minute',
  'service.max_daily_capacity_label': 'Max Daily Capacity',
  'service.walk_in_allowed': 'Walk-in Allowed',
  'service.requires_doctor': 'Requires Doctor',
  'service.preparation_instructions': 'Preparation Instructions',
  'service.preparation_instructions_placeholder': 'Enter preparation instructions for patients',
  'service.clinic_required': 'Clinic is required',

  // Form actions
  'service.creating': 'Creating...',
  'service.created_success': 'Service created successfully!',
  'service.create_failed': 'Failed to create service. Please try again.',
  'service.updating': 'Updating...',
  'service.update_service': 'Update Service',
  'service.updated_success': 'Service updated successfully!',
  'service.update_failed': 'Failed to update service. Please try again.',
  'service.cancel': 'Cancel',

  // Access control
  'service.access_denied': 'Access Denied',
  'service.access_denied_create': 'You do not have permission to create services.',
  'service.access_denied_edit': 'You do not have permission to edit services.',
  'service.clinic_required_page': 'Clinic Required',
  'service.clinic_required_desc': 'You must be associated with a clinic to manage services.',
};
