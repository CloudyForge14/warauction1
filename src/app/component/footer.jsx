'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      {/* Container */}
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-40">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">CloudyForge</h3>
          <p className="text-gray-400">
            Your trusted store for unique trophies and auction items. We strive to deliver quality and satisfaction.
          </p>
        </div>

        {/* Support Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Support</h3>
          <ul>
            <li>
              <a
                href="mailto:support@gloooudy.com"
                className="text-gray-400 hover:text-white transition"
              >
                ✉️ Email: support@cloudyforge.com
              </a>
            </li>
            <li>
              <a
                href="https://t.me/GloOouD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                📱 Telegram: @GloOouD
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Legal</h3>
          <p className="text-gray-400">
            © 2024 CloudyForge. All rights reserved.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-8 pt-4 text-center">
        <p className="text-gray-500 text-sm">
          Designed with ❤️ by the CloudyForge Team.
        </p>
      </div>
    </footer>
  );
}
