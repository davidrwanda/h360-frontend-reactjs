import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryClinic, useClaimClinic, useVerifyClaimOtp, useResendClaimOtp, useUploadClaimDocuments } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardContent, Button, Input, Select, Loading } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import {
  MdArrowBack,
  MdLocalHospital,
  MdCheckCircle,
  MdUploadFile,
  MdSend,
  MdRefresh,
} from 'react-icons/md';

type Step = 'form' | 'otp' | 'documents' | 'success';

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'other', label: 'Other' },
];

const verificationOptions = [
  { value: 'phone', label: 'Phone (SMS)' },
  { value: 'email', label: 'Email' },
];

export const ClaimClinicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: clinic, isLoading: clinicLoading } = useDirectoryClinic(slug || '');
  const claimMutation = useClaimClinic();
  const verifyMutation = useVerifyClaimOtp();
  const resendMutation = useResendClaimOtp();
  const uploadMutation = useUploadClaimDocuments();

  const [step, setStep] = useState<Step>('form');
  const [claimId, setClaimId] = useState('');

  // Step 1: Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('owner');
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email'>('phone');

  // Step 2: OTP
  const [otp, setOtp] = useState('');

  // Step 3: Documents
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmitClaim = async () => {
    if (!clinic || !name.trim() || !email.trim() || !phone.trim()) return;
    try {
      const result = await claimMutation.mutateAsync({
        clinicId: clinic.id,
        data: {
          claimant_name: name.trim(),
          claimant_email: email.trim(),
          claimant_phone: phone.trim(),
          claimant_role: role,
          verification_method: verificationMethod,
        },
      });
      setClaimId(result.claim_id);
      showSuccess(t(DIRECTORY.CLAIM_SUBMITTED));
      setStep('otp');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit claim.';
      showError(msg);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || !claimId) return;
    try {
      await verifyMutation.mutateAsync({ claimId, otp: otp.trim() });
      showSuccess(t(DIRECTORY.CLAIM_VERIFIED));
      setStep('documents');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP. Please try again.';
      showError(msg);
    }
  };

  const handleResendOtp = async () => {
    if (!claimId) return;
    try {
      await resendMutation.mutateAsync(claimId);
      showSuccess('OTP resent successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend OTP.';
      showError(msg);
    }
  };

  const handleUploadDocuments = async () => {
    if (!claimId) return;
    if (files.length > 0) {
      try {
        await uploadMutation.mutateAsync({ claimId, files });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to upload documents.';
        showError(msg);
        return;
      }
    }
    setStep('success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  if (clinicLoading) {
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

  const stepIndicator = (
    <div className="mb-8 flex items-center justify-center gap-2">
      {(['form', 'otp', 'documents', 'success'] as Step[]).map((s, idx) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step === s
                ? 'bg-azure-dragon text-white'
                : (['form', 'otp', 'documents', 'success'].indexOf(step) > idx)
                  ? 'bg-verdant text-white'
                  : 'bg-carbon/10 text-carbon/40'
            }`}
          >
            {(['form', 'otp', 'documents', 'success'].indexOf(step) > idx) ? (
              <MdCheckCircle className="h-5 w-5" />
            ) : (
              idx + 1
            )}
          </div>
          {idx < 3 && (
            <div className={`mx-1 h-0.5 w-8 ${
              ['form', 'otp', 'documents', 'success'].indexOf(step) > idx ? 'bg-verdant' : 'bg-carbon/10'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />

      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/directory/${slug}`)}
          className="mb-4"
        >
          <MdArrowBack className="h-4 w-4 mr-1" />
          {t(COMMON.BACK)}
        </Button>

        {/* Clinic name */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure-dragon/10">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-carbon">
              {t(DIRECTORY.CLAIM_CLINIC)}
            </h1>
            <p className="text-sm text-carbon/60">{clinic?.name}</p>
          </div>
        </div>

        {stepIndicator}

        {/* Step 1: Claim Form */}
        {step === 'form' && (
          <Card variant="elevated">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-carbon/60 mb-2">{t(DIRECTORY.CLAIM_DESCRIPTION)}</p>
              <Input
                label={t(DIRECTORY.CLAIMANT_NAME)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={t(DIRECTORY.CLAIMANT_EMAIL)}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label={t(DIRECTORY.CLAIMANT_PHONE)}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Select
                label={t(DIRECTORY.CLAIMANT_ROLE)}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={roleOptions}
              />
              <Select
                label={t(DIRECTORY.VERIFICATION_METHOD)}
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value as 'phone' | 'email')}
                options={verificationOptions}
              />
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={handleSubmitClaim}
                  disabled={!name.trim() || !email.trim() || !phone.trim() || claimMutation.isPending}
                >
                  {claimMutation.isPending ? t(COMMON.SAVING) : (
                    <>
                      <MdSend className="h-4 w-4 mr-2" />
                      {t(DIRECTORY.SUBMIT_CLAIM)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <Card variant="elevated">
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-carbon">{t(DIRECTORY.VERIFY_OTP)}</h2>
                <p className="text-sm text-carbon/60 mt-1">
                  A verification code has been sent to your {verificationMethod === 'phone' ? 'phone' : 'email'}.
                </p>
              </div>
              <Input
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resendMutation.isPending}
                >
                  <MdRefresh className="h-4 w-4 mr-1" />
                  {t(DIRECTORY.RESEND_OTP)}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleVerifyOtp}
                  disabled={otp.trim().length < 4 || verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? t(COMMON.SAVING) : t(DIRECTORY.VERIFY_OTP)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Document Upload */}
        {step === 'documents' && (
          <Card variant="elevated">
            <CardContent className="p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-carbon">Upload Documents</h2>
                <p className="text-sm text-carbon/60 mt-1">
                  Optionally upload supporting documents (e.g., business license, ID).
                  This step is optional and can speed up the approval process.
                </p>
              </div>
              <div
                className="rounded-lg border-2 border-dashed border-carbon/20 p-8 text-center cursor-pointer hover:border-azure-dragon/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <MdUploadFile className="h-10 w-10 text-carbon/30 mx-auto mb-2" />
                <p className="text-sm text-carbon/60">
                  Click to upload files
                </p>
                <p className="text-xs text-carbon/40 mt-1">
                  PDF, JPG, PNG (max 10MB each)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {files.length > 0 && (
                <div className="space-y-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded bg-carbon/5 px-3 py-2 text-sm text-carbon">
                      <MdUploadFile className="h-4 w-4 text-carbon/40" />
                      {f.name}
                      <span className="text-xs text-carbon/40 ml-auto">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep('success')}>
                  Skip
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUploadDocuments}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? t(COMMON.SAVING) : (
                    <>
                      <MdUploadFile className="h-4 w-4 mr-2" />
                      {files.length > 0 ? 'Upload & Continue' : 'Continue'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <Card variant="elevated">
            <CardContent className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verdant/10 mx-auto mb-4">
                <MdCheckCircle className="h-10 w-10 text-verdant" />
              </div>
              <h2 className="text-lg font-bold text-carbon mb-2">Claim Submitted Successfully</h2>
              <p className="text-sm text-carbon/60 mb-6">
                Your claim for <strong>{clinic?.name}</strong> has been submitted and is now pending review.
                You will receive a notification once the claim has been reviewed.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/directory')}>
                  {t(DIRECTORY.SEARCH_CLINICS)}
                </Button>
                <Button variant="primary" onClick={() => navigate(`/directory/${slug}`)}>
                  {t(DIRECTORY.VIEW_PROFILE)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
