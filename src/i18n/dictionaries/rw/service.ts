import type { Dictionary } from '../../types';

export const serviceRw: Dictionary = {
  // Page header
  'service.services_management': 'Gucunga Serivisi',
  'service.manage_clinic_services': "Gucunga serivisi z'ivuriro ryawe",
  'service.create_service': 'Kora Serivisi',
  'service.create_new_service': 'Kora Serivisi Nshya',
  'service.add_service_desc': "Ongeraho serivisi nshya mu ivuriro",
  'service.edit_service': 'Hindura Serivisi',
  'service.update_service_info': "Hindura amakuru ya serivisi",
  'service.service_details': "Ibisobanuro bya Serivisi",

  // Filters
  'service.filters': 'Gushungura',
  'service.show_advanced': 'Erekana Byimbitse',
  'service.hide_advanced': 'Hisha Byimbitse',
  'service.search': 'Gushakisha',
  'service.search_placeholder': 'Shakisha izina cyangwa kode...',
  'service.status': 'Imiterere',
  'service.all_status': 'Imiterere Yose',
  'service.active': 'Arakora',
  'service.inactive': 'Ntakora',
  'service.category': 'Icyiciro',
  'service.category_placeholder': 'Shungura ku cyiciro',
  'service.requires_appointment': 'Bisaba Gahunda',
  'service.all': 'Byose',
  'service.yes': 'Yego',
  'service.no': 'Oya',
  'service.clear_filters': 'Siba',

  // Table
  'service.service_code': 'Kode ya Serivisi',
  'service.name': 'Izina',
  'service.price': 'Igiciro',
  'service.duration': 'Igihe',
  'service.duration_min': '{{minutes}} min',
  'service.actions': 'Ibikorwa',
  'service.no_services_found': 'Nta serivisi zibonetse',
  'service.failed_to_load': 'Byanze gufungura serivisi',
  'service.activate_service_tooltip': 'Kongera gukora serivisi',

  // Pagination
  'service.page_of': 'Urupapuro {{page}} mu {{totalPages}}',
  'service.previous': 'Ibanza',
  'service.next': 'Ibikurikira',

  // Deactivate/Activate modals
  'service.deactivate_title': 'Hagarika Serivisi',
  'service.deactivate_message': 'Uzi neza ko ushaka guhagarika "{{name}}"? Ibi birashobora gusubirwaho nyuma.',
  'service.deactivate': 'Hagarika',
  'service.activate_title': 'Kongera Gukora Serivisi',
  'service.activate_message': 'Uzi neza ko ushaka kongera gukora "{{name}}"?',
  'service.activate': 'Kongera gukora',

  // Detail page
  'service.service_information': 'Amakuru ya Serivisi',
  'service.service_not_found': 'Serivisi Ntabwo Yabonetse',
  'service.service_not_found_desc': "Serivisi ushaka ntabwo ihari cyangwa yakuweho.",
  'service.back': 'Subira',
  'service.clinic': 'Ivuriro',
  'service.max_daily_capacity': 'Umubare Ntarengwa ku Munsi',
  'service.appointment_type': "Ubwoko bw'Igihe cyo Gusura",
  'service.requires_appointment_label': 'Bisaba Gahunda',
  'service.walk_in_available': 'Kwinjira Bidakeneye Gahunda',
  'service.description': 'Ibisobanuro',
  'service.assigned_doctors': 'Abaganga Batanzwe',
  'service.unknown_doctor': 'Umuganga Utazwi',
  'service.custom_price': 'Igiciro cyihariye',
  'service.custom_duration': 'Igihe cyihariye',

  // Create/Edit form
  'service.service_name': 'Izina rya Serivisi',
  'service.service_name_placeholder': 'Andika izina rya serivisi',
  'service.service_name_required': 'Izina rya serivisi rirakenewe',
  'service.service_code_label': 'Kode ya Serivisi',
  'service.service_code_placeholder': 'Andika kode ya serivisi',
  'service.service_code_required': 'Kode ya serivisi irakenewe',
  'service.description_placeholder': 'Andika ibisobanuro bya serivisi',
  'service.category_select_placeholder': 'Hitamo cyangwa wandike icyiciro',
  'service.price_placeholder': 'Andika igiciro',
  'service.price_required': 'Igiciro kigomba kuba umubare wemeza',
  'service.duration_label': 'Igihe (amasegonda)',
  'service.duration_min_error': 'Igihe kigomba kuba nibura umunota 1',
  'service.max_daily_capacity_label': 'Umubare Ntarengwa ku Munsi',
  'service.walk_in_allowed': 'Kwinjira Bidakeneye Gahunda Byemewe',
  'service.clinic_required': 'Ivuriro rirakenewe',

  // Form actions
  'service.creating': 'Birimo gukora...',
  'service.created_success': 'Serivisi yakozwe neza!',
  'service.create_failed': 'Byanze gukora serivisi. Nyamuneka ongera ugerageze.',
  'service.updating': 'Birimo guhindura...',
  'service.update_service': 'Hindura Serivisi',
  'service.updated_success': 'Serivisi yahindutse neza!',
  'service.update_failed': 'Byanze guhindura serivisi. Nyamuneka ongera ugerageze.',
  'service.cancel': 'Kureka',

  // Access control
  'service.access_denied': 'Ntabwo Wemerewe',
  'service.access_denied_create': 'Ntabwo ufite uburenganzira bwo gukora serivisi.',
  'service.access_denied_edit': 'Ntabwo ufite uburenganzira bwo guhindura serivisi.',
  'service.clinic_required_page': 'Ivuriro Rirakenewe',
  'service.clinic_required_desc': 'Ugomba kuba uhujwe n\'ivuriro kugira ucunge serivisi.',
};
