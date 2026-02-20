import { Link } from 'react-router-dom';
import { MdEmail, MdPhone, MdLocalHospital } from 'react-icons/md';
import { useTranslation, COMMON, LANDING } from '@/i18n';

export const PublicFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-carbon text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MdLocalHospital className="h-6 w-6" />
              <span className="text-lg font-heading font-bold">H360</span>
            </div>
            <p className="text-white/70 text-sm">
              {t(LANDING.FOOTER_DESC)}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t(LANDING.QUICK_LINKS)}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  {t(COMMON.REGISTER)}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  {t(COMMON.LOGIN)}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t(LANDING.CONTACT)}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MdEmail className="h-4 w-4" />
                <span>support@h360.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MdPhone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p>{t(LANDING.ALL_RIGHTS_RESERVED, { year: String(new Date().getFullYear()) })}</p>
        </div>
      </div>
    </footer>
  );
};
