'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-gray-900 text-white py-8 px-6 left-0 w-full">

      {/* Container */}
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-40">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">{t('company.title')}</h3>
          <p className="text-gray-400">{t('company.description')}</p>
        </div>

        {/* Support Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">{t('support.title')}</h3>
          <ul>
            <li>
              <a
                href="mailto:support@cloudyforge.com"
                className="text-gray-400 hover:text-white transition"
              >
                {t('support.email')}
              </a>
            </li>
            <li>
              <a
                href="https://x.com/GloOouD "
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                {t('support.twitter')}
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">{t('legal.title')}</h3>
          <p className="text-gray-400">{t('legal.copyright')}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-8 pt-4 text-center">
        <p className="text-gray-500 text-sm">{t('footerNote')}</p>
      </div>
    </footer>
  );
}
