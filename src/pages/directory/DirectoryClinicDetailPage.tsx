import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDirectoryClinic, useCreateBookingAttempt, useCreateCorrection } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Input, Modal } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import {
  MdArrowBack,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdSchedule,
  MdLocalHospital,
  MdVerified,
  MdBookOnline,
  MdPeople,
  MdMedicalServices,
  MdPhoto,
  MdEdit,
  MdFlag,
  MdPerson,
} from 'react-icons/md';

const claimBadge: Record<string, { label: string; className: string; icon?: boolean }> = {
  unclaimed: { label: 'Unclaimed', className: 'bg-carbon/10 text-carbon/60' },
  pending: { label: 'Claim Pending', className: 'bg-amber-100 text-amber-700' },
  claimed: { label: 'Claimed', className: 'bg-azure-dragon/10 text-azure-dragon' },
  verified: { label: 'Verified', className: 'bg-verdant/10 text-verdant', icon: true },
};

export const DirectoryClinicDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const { data: clinic, isLoading, error } = useDirectoryClinic(slug || '');
  const bookingMutation = useCreateBookingAttempt();

  const correctionMutation = useCreateCorrection();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionType, setCorrectionType] = useState('other');
  const [correctionDesc, setCorrectionDesc] = useState('');
  const [correctionEmail, setCorrectionEmail] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleBookingSubmit = async () => {
    if (!clinic || !bookingName.trim()) return;
    try {
      await bookingMutation.mutateAsync({
        clinicId: clinic.id,
        data: {
          visitor_name: bookingName.trim(),
          visitor_email: bookingEmail.trim() || undefined,
          visitor_phone: bookingPhone.trim() || undefined,
          message: bookingMessage.trim() || undefined,
        },
      });
      showSuccess(t(DIRECTORY.BOOKING_RECORDED));
      setShowBookingModal(false);
      setBookingName('');
      setBookingEmail('');
      setBookingPhone('');
      setBookingMessage('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit booking request.';
      showError(msg);
    }
  };

  const handleCorrectionSubmit = async () => {
    if (!clinic || !correctionDesc.trim()) return;
    try {
      await correctionMutation.mutateAsync({
        clinicId: clinic.id,
        data: {
          correction_type: correctionType,
          description: correctionDesc.trim(),
          email: correctionEmail.trim() || undefined,
        },
      });
      showSuccess(t(DIRECTORY.CORRECTION_SUBMITTED));
      setShowCorrectionModal(false);
      setCorrectionType('other');
      setCorrectionDesc('');
      setCorrectionEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit correction.';
      showError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-smudged-lips mb-4">Clinic Not Found</h2>
              <p className="text-carbon/60 mb-6">
                The clinic you are looking for may have been removed or does not exist.
              </p>
              <Link to="/directory">
                <Button variant="primary">{t(DIRECTORY.SEARCH_CLINICS)}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const badge = claimBadge[clinic.claim_status] ?? claimBadge.unclaimed!;
  const fullAddress = [clinic.address, clinic.city, clinic.state, clinic.country]
    .filter(Boolean)
    .join(', ');

  const operatingHoursEntries = clinic.operating_hours
    ? Object.entries(clinic.operating_hours)
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/directory')}
          className="mb-4"
        >
          <MdArrowBack className="h-4 w-4 mr-1" />
          {t(COMMON.BACK)}
        </Button>

        {/* Hero */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-carbon/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {clinic.logo_url ? (
                <img
                  src={clinic.logo_url}
                  alt={clinic.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-azure-dragon/10">
                  <MdLocalHospital className="h-8 w-8 text-azure-dragon" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-heading font-bold text-carbon">{clinic.name}</h1>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                    {badge.icon && <MdVerified className="h-3 w-3 mr-0.5" />}
                    {badge.label}
                  </span>
                </div>
                {fullAddress && (
                  <p className="text-sm text-carbon/60 flex items-center gap-1">
                    <MdLocationOn className="h-4 w-4 flex-shrink-0" />
                    {fullAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {clinic.allow_online_booking ? (
                <Link to={`/book-appointment?clinic_id=${clinic.id}`}>
                  <Button variant="primary" size="md">
                    <MdBookOnline className="h-4 w-4 mr-2" />
                    {t(DIRECTORY.BOOK_NOW)}
                  </Button>
                </Link>
              ) : clinic.claim_status === 'unclaimed' ? (
                <Button variant="primary" size="md" onClick={() => setShowBookingModal(true)}>
                  <MdBookOnline className="h-4 w-4 mr-2" />
                  {t(DIRECTORY.REQUEST_BOOKING)}
                </Button>
              ) : null}
              {clinic.claim_status === 'unclaimed' && (
                <Link to={`/directory/${slug}/claim`}>
                  <Button variant="outline" size="md">
                    <MdFlag className="h-4 w-4 mr-2" />
                    {t(DIRECTORY.CLAIM_CLINIC)}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowCorrectionModal(true)}>
                <MdEdit className="h-4 w-4 mr-1" />
                {t(DIRECTORY.SUBMIT_CORRECTION)}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {clinic.description && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-carbon/70 leading-relaxed">{clinic.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {clinic.services && clinic.services.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdMedicalServices className="h-5 w-5 text-azure-dragon" />
                    {t(DIRECTORY.SERVICES)} ({clinic.services.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-carbon/5">
                    {clinic.services.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-carbon font-medium">{svc.name}</span>
                        <div className="flex items-center gap-3 text-xs text-carbon/50">
                          {svc.duration_minutes && <span>{svc.duration_minutes} min</span>}
                          {svc.price != null && <span className="font-medium text-carbon/70">{svc.price.toLocaleString()} RWF</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Providers */}
            {clinic.providers && clinic.providers.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdPeople className="h-5 w-5 text-azure-dragon" />
                    {t(DIRECTORY.PROVIDERS)} ({clinic.providers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {clinic.providers.map((prov) => (
                      <div key={prov.id} className="flex items-center gap-3 rounded-lg border border-carbon/5 p-3">
                        {prov.photo_url ? (
                          <img
                            src={prov.photo_url}
                            alt={prov.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-azure-dragon/10">
                            <MdPerson className="h-5 w-5 text-azure-dragon" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-carbon">{prov.name}</p>
                          <p className="text-xs text-carbon/50">{prov.specialty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {clinic.photos && clinic.photos.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdPhoto className="h-5 w-5 text-azure-dragon" />
                    Photos ({clinic.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {clinic.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.caption || clinic.name}
                        className="h-32 w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedPhoto(photo.url)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Contact info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clinic.phone && (
                  <div className="flex items-center gap-3">
                    <MdPhone className="h-4 w-4 text-carbon/40 flex-shrink-0" />
                    <a href={`tel:${clinic.phone}`} className="text-sm text-azure-dragon hover:underline">
                      {clinic.phone}
                    </a>
                  </div>
                )}
                {clinic.email && (
                  <div className="flex items-center gap-3">
                    <MdEmail className="h-4 w-4 text-carbon/40 flex-shrink-0" />
                    <a href={`mailto:${clinic.email}`} className="text-sm text-azure-dragon hover:underline truncate">
                      {clinic.email}
                    </a>
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center gap-3">
                    <MdLanguage className="h-4 w-4 text-carbon/40 flex-shrink-0" />
                    <a
                      href={clinic.website.startsWith('http') ? clinic.website : `https://${clinic.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-azure-dragon hover:underline truncate"
                    >
                      {clinic.website}
                    </a>
                  </div>
                )}
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <MdLocationOn className="h-4 w-4 text-carbon/40 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-carbon/70">{fullAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating hours */}
            {operatingHoursEntries.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdSchedule className="h-5 w-5 text-azure-dragon" />
                    Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {operatingHoursEntries.map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-carbon capitalize">{day}</span>
                        {hours.is_closed ? (
                          <span className="text-smudged-lips text-xs">Closed</span>
                        ) : (
                          <span className="text-carbon/60">{hours.open} - {hours.close}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile completeness */}
            <Card variant="elevated">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-carbon/60">{t(DIRECTORY.PROFILE_COMPLETENESS)}</span>
                  <span className="text-xs font-bold text-carbon">{clinic.profile_completeness ?? 0}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-carbon/10">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (clinic.profile_completeness ?? 0) >= 80
                        ? 'bg-verdant'
                        : (clinic.profile_completeness ?? 0) >= 50
                          ? 'bg-amber-400'
                          : 'bg-smudged-lips'
                    }`}
                    style={{ width: `${Math.min(clinic.profile_completeness ?? 0, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />

      {/* Booking attempt modal (unclaimed clinics) */}
      {showBookingModal && (
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title={t(DIRECTORY.REQUEST_BOOKING)}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/60">
              This clinic has not yet been claimed on H360. Submit your booking request and we will attempt to contact them on your behalf.
            </p>
            <Input
              label="Your Name"
              value={bookingName}
              onChange={(e) => setBookingName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
            />
            <Input
              label="Phone"
              value={bookingPhone}
              onChange={(e) => setBookingPhone(e.target.value)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">Message (optional)</label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                placeholder="What service are you looking for?"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleBookingSubmit}
                disabled={!bookingName.trim() || bookingMutation.isPending}
              >
                {bookingMutation.isPending ? t(COMMON.SAVING) : t(DIRECTORY.REQUEST_BOOKING)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Correction modal */}
      {showCorrectionModal && (
        <Modal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          title={t(DIRECTORY.SUBMIT_CORRECTION)}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/60">
              See something incorrect about this listing? Submit a correction and our team will review it.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">
                {t(DIRECTORY.CORRECTION_TYPE)}
              </label>
              <select
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="address">Address</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="hours">Operating Hours</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">Description</label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                placeholder="Describe what needs to be corrected..."
                value={correctionDesc}
                onChange={(e) => setCorrectionDesc(e.target.value)}
                required
              />
            </div>
            <Input
              label="Your Email (optional)"
              type="email"
              value={correctionEmail}
              onChange={(e) => setCorrectionEmail(e.target.value)}
              placeholder="To receive updates about your correction"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCorrectionModal(false)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleCorrectionSubmit}
                disabled={!correctionDesc.trim() || correctionMutation.isPending}
              >
                {correctionMutation.isPending ? t(COMMON.SAVING) : t(DIRECTORY.SUBMIT_CORRECTION)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Photo lightbox */}
      {selectedPhoto && (
        <Modal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          title=""
          size="lg"
        >
          <div className="flex items-center justify-center">
            <img
              src={selectedPhoto}
              alt="Clinic photo"
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
