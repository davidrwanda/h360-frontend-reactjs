import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { useServices, useDeactivateService, useActivateService, useDoctorServices } from '@/hooks/useServices';
import { ServicesTable } from '@/components/services/ServicesTable';
import { Button, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select, Input } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import type { Service } from '@/api/services';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // Check if user can edit (only managers and admins)
  const normalizedRole = role?.toUpperCase();
  const canEdit = normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN';
  const isDoctor = normalizedRole === 'DOCTOR';
  
  // For clinic managers, automatically use their clinic_id (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id || undefined;
  
  // For doctors, fetch their doctor record to get doctor_id
  const { data: doctorsData } = useDoctors({
    user_id: user?.user_id,
    limit: 1,
  });
  
  const doctor = doctorsData?.data?.[0];
  
  // For doctors, fetch only their assigned services
  const { data: doctorServicesData, isLoading: isLoadingDoctorServices } = useDoctorServices(
    doctor?.doctor_id || '',
    isDoctor && !!doctor?.doctor_id
  );
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [requiresAppointmentFilter, setRequiresAppointmentFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [serviceToActivate, setServiceToActivate] = useState<Service | null>(null);

  // For doctors, use assigned services; for others, use regular services list
  const { data, isLoading, error } = useServices({
    page,
    limit,
    search: search || undefined,
    clinic_id: clinicId,
    category: categoryFilter || undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    requires_appointment: requiresAppointmentFilter === 'true' ? true : requiresAppointmentFilter === 'false' ? false : undefined,
  });

  // For doctors, filter assigned services client-side
  let services: Service[] = [];
  let totalPages = 1;
  
  if (isDoctor) {
    if (isLoadingDoctorServices) {
      // Will show loading state
    } else {
      const allServices = doctorServicesData || [];
      // Apply filters client-side
      let filtered = allServices;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(searchLower) ||
          s.service_code.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (categoryFilter) {
        filtered = filtered.filter(s => s.category === categoryFilter);
      }
      
      if (statusFilter === 'active') {
        filtered = filtered.filter(s => s.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(s => !s.is_active);
      }
      
      if (requiresAppointmentFilter === 'true') {
        filtered = filtered.filter(s => s.requires_appointment);
      } else if (requiresAppointmentFilter === 'false') {
        filtered = filtered.filter(s => !s.requires_appointment);
      }
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      services = filtered.slice(startIndex, endIndex);
      totalPages = Math.ceil(filtered.length / limit);
    }
  } else {
    services = data?.data || [];
    totalPages = data?.totalPages || Math.ceil((data?.total || 0) / limit);
  }
  
  const isLoadingServices = isDoctor ? isLoadingDoctorServices : isLoading;

  const hasActiveFilters = 
    search || statusFilter !== 'active' || categoryFilter || requiresAppointmentFilter;

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('active');
    setCategoryFilter('');
    setRequiresAppointmentFilter('');
    setPage(1);
  };

  const deactivateMutation = useDeactivateService();
  const activateMutation = useActivateService();

  const handleEdit = (service: Service) => {
    navigate(`/services/${service.service_id}/edit`);
  };

  const handleView = (service: Service) => {
    navigate(`/services/${service.service_id}`);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await deactivateMutation.mutateAsync(serviceToDelete.service_id);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Failed to deactivate service:', error);
    }
  };

  const handleActivate = (service: Service) => {
    setServiceToActivate(service);
  };

  const handleActivateConfirm = async () => {
    if (!serviceToActivate) return;

    try {
      await activateMutation.mutateAsync(serviceToActivate.service_id);
      setServiceToActivate(null);
    } catch (error) {
      console.error('Failed to activate service:', error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            Services Management
          </h1>
          <p className="text-sm text-carbon/60">
            Manage clinic services and offerings
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/services/create')}
            >
              <MdAdd className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Input
                label="Search"
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-carbon/10 mt-4">
              <Input
                label="Category"
                type="text"
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              />

              <Select
                label="Requires Appointment"
                value={requiresAppointmentFilter}
                onChange={(e) => {
                  setRequiresAppointmentFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All' },
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                <MdClear className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-smudged-lips">
                Failed to load services. Please try again.
              </p>
            </div>
          ) : (
            <>
              <ServicesTable
                services={services}
                isLoading={isLoadingServices}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canEdit ? handleDelete : undefined}
                onActivate={canEdit ? handleActivate : undefined}
                onView={handleView}
                canEdit={canEdit}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-carbon/10 px-4 py-3">
                  <p className="text-sm text-carbon/60">
                    Page {page} of {totalPages} ({data?.total || 0} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {serviceToDelete && serviceToDelete.is_active && (
        <DeleteConfirmationModal
          isOpen={!!serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Deactivate Service"
          message={`Are you sure you want to deactivate "${serviceToDelete.name}"? This service will no longer be available for appointments.`}
          confirmText="Deactivate"
          isLoading={deactivateMutation.isPending}
        />
      )}

      {/* Activate Confirmation Modal */}
      {serviceToActivate && !serviceToActivate.is_active && (
        <DeleteConfirmationModal
          isOpen={!!serviceToActivate}
          onClose={() => setServiceToActivate(null)}
          onConfirm={handleActivateConfirm}
          title="Activate Service"
          message={`Are you sure you want to activate "${serviceToActivate.name}"? This service will become available for appointments.`}
          confirmText="Activate"
          actionLabel="Activate"
          isLoading={activateMutation.isPending}
        />
      )}
    </div>
  );
};
