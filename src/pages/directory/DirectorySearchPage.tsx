import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDirectorySearch } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY } from '@/i18n';
import { Button, Input, Loading, Card, CardContent } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import {
  MdSearch,
  MdLocalHospital,
  MdPeople,
  MdLocationOn,
  MdVerified,
  MdBookOnline,
  MdChevronLeft,
  MdChevronRight,
  MdFilterList,
} from 'react-icons/md';
import type { DirectoryClinic, DirectorySearchParams } from '@/types/directory';

const claimBadge: Record<string, { label: string; className: string }> = {
  unclaimed: { label: 'Unclaimed', className: 'bg-carbon/10 text-carbon/60' },
  pending: { label: 'Claim Pending', className: 'bg-amber-100 text-amber-700' },
  claimed: { label: 'Claimed', className: 'bg-azure-dragon/10 text-azure-dragon' },
  verified: { label: 'Verified', className: 'bg-verdant/10 text-verdant' },
};

const ClinicCard = ({ clinic, onClick }: { clinic: DirectoryClinic; onClick: () => void }) => {
  const { t } = useTranslation();
  const badge = claimBadge[clinic.claim_status] ?? claimBadge.unclaimed!;
  const completeness = clinic.profile_completeness ?? 0;

  return (
    <Card
      variant="elevated"
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {clinic.logo_url ? (
              <img
                src={clinic.logo_url}
                alt={clinic.name}
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure-dragon/10 flex-shrink-0">
                <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-carbon truncate">{clinic.name}</h3>
              {clinic.city && (
                <p className="text-xs text-carbon/50 flex items-center gap-1 mt-0.5">
                  <MdLocationOn className="h-3 w-3 flex-shrink-0" />
                  {clinic.city}
                </p>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${badge.className}`}>
            {clinic.claim_status === 'verified' && <MdVerified className="h-3 w-3 mr-0.5" />}
            {badge.label}
          </span>
        </div>

        {/* Provider count */}
        <div className="flex items-center gap-4 text-xs text-carbon/60 mb-3">
          <span className="flex items-center gap-1">
            <MdPeople className="h-3.5 w-3.5" />
            {clinic.provider_count ?? 0} {t(DIRECTORY.PROVIDERS)}
          </span>
          {clinic.allow_online_booking && (
            <span className="flex items-center gap-1 text-verdant">
              <MdBookOnline className="h-3.5 w-3.5" />
              {t(DIRECTORY.ONLINE_BOOKING)}
            </span>
          )}
        </div>

        {/* Services tags */}
        {clinic.services_summary && clinic.services_summary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {clinic.services_summary.slice(0, 4).map((svc) => (
              <span
                key={svc}
                className="inline-block rounded-full bg-azure-dragon/5 px-2 py-0.5 text-[10px] text-azure-dragon font-medium"
              >
                {svc}
              </span>
            ))}
            {clinic.services_summary.length > 4 && (
              <span className="inline-block rounded-full bg-carbon/5 px-2 py-0.5 text-[10px] text-carbon/50">
                +{clinic.services_summary.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Profile completeness bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-carbon/50">{t(DIRECTORY.PROFILE_COMPLETENESS)}</span>
            <span className="text-[10px] font-medium text-carbon/70">{completeness}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-carbon/10">
            <div
              className={`h-1.5 rounded-full transition-all ${
                completeness >= 80
                  ? 'bg-verdant'
                  : completeness >= 50
                    ? 'bg-amber-400'
                    : 'bg-smudged-lips'
              }`}
              style={{ width: `${Math.min(completeness, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DirectorySearchPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [services, setServices] = useState(searchParams.get('services') || '');
  const [onlineBookingOnly, setOnlineBookingOnly] = useState(searchParams.get('online') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page') || '1');
  const limit = 12;

  const queryParams = useMemo<DirectorySearchParams>(() => {
    const params: DirectorySearchParams = { page, limit };
    const q = searchParams.get('q');
    if (q) params.search = q;
    if (searchParams.get('city')) params.city = searchParams.get('city')!;
    if (searchParams.get('services')) params.services = searchParams.get('services')!.split(',');
    if (searchParams.get('online') === 'true') params.has_online_booking = true;
    return params;
  }, [searchParams, page]);

  const { data, isLoading, error } = useDirectorySearch(queryParams);

  const clinics = data?.data || [];
  const totalPages = data?.totalPages || 0;

  const applySearch = () => {
    const params: Record<string, string> = {};
    if (searchInput.trim()) params.q = searchInput.trim();
    if (city.trim()) params.city = city.trim();
    if (services.trim()) params.services = services.trim();
    if (onlineBookingOnly) params.online = 'true';
    params.page = '1';
    setSearchParams(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applySearch();
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    setSearchParams(params);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-azure-dragon">
            {t(DIRECTORY.CLINIC_DIRECTORY)}
          </h1>
          <p className="text-sm text-carbon/60 mt-1">{t(DIRECTORY.SEARCH_CLINICS)}</p>
        </div>

        {/* Search bar */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t(DIRECTORY.SEARCH_PLACEHOLDER)}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button variant="primary" onClick={applySearch}>
              <MdSearch className="h-5 w-5 mr-1" />
              {t(DIRECTORY.SEARCH_CLINICS)}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex"
            >
              <MdFilterList className="h-5 w-5 mr-1" />
              Filters
            </Button>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg border border-carbon/10 bg-white p-4">
              <div className="w-48">
                <Input
                  label={t(DIRECTORY.FILTER_BY_CITY)}
                  placeholder="e.g. Kigali"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="w-48">
                <Input
                  label={t(DIRECTORY.FILTER_BY_SERVICES)}
                  placeholder="e.g. Dental, Lab"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-carbon">
                  <input
                    type="checkbox"
                    checked={onlineBookingOnly}
                    onChange={(e) => setOnlineBookingOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon/30"
                  />
                  {t(DIRECTORY.ONLINE_BOOKING)}
                </label>
              </div>
              <div className="flex items-end">
                <Button variant="primary" size="sm" onClick={applySearch}>
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-8 text-center">
            <p className="text-sm text-smudged-lips">Failed to load directory clinics.</p>
          </div>
        ) : clinics.length === 0 ? (
          <div className="py-20 text-center">
            <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-carbon mb-2">{t(DIRECTORY.NO_RESULTS)}</h2>
            <p className="text-sm text-carbon/60">{t(DIRECTORY.NO_RESULTS_HINT)}</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-xs text-carbon/50 mb-4">
              {data?.total ?? 0} {t(DIRECTORY.TOTAL_CLINICS).toLowerCase()} found
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onClick={() => navigate(`/directory/${clinic.seo_slug}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <MdChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  <MdChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
