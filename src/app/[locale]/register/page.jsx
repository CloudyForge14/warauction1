'use client';

import { supabase } from '@/utils/supabase/client';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [agreed, setAgreed] = useState(false); // Состояние чекбокса
  const [showTermsModal, setShowTermsModal] = useState(false); // Модалка с Terms

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Register');

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');

    // Проверяем, что пользователь согласился с Terms
    if (!agreed) {
      toast.error('You must agree with all terms before registering.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('registrationSuccessful'));
        handleNavigation('/auction');
      } else {
        setError(data.error || t('errorGeneric'));
        toast.error(data.error || t('errorGeneric'));
      }
    } catch (err) {
      toast.error(t('errorOccurred'));
      console.error(err);
    }
  };

  const handleNavigation = (path) => {
    const localizedPath = `/${locale}${path}`;
    router.push(localizedPath);
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          marginTop: '60px',
          backgroundColor: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        progressStyle={{ backgroundColor: '#2563eb' }}
      />

      {/* Модальное окно для Terms & Conditions */}
      {showTermsModal && (
        <div className="fixed inset-0 z-40 mt-10 flex items-center justify-center bg-black bg-opacity-40 p-4">
          {/* Внутренний контейнер модалки */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-3 right-3 text-white hover:text-red-400"
            >
              ✕
            </button>
            {/* Заголовок */}
            <h2 className="text-xl font-bold mb-4">Public Offer General</h2>
            
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
  <strong className="block mb-2">Public Offer General</strong>
  <strong className="block mb-4">PUBLIC CONTRACT (OFFER)</strong>

  to order, purchase and sale, and delivery of goods

  <br /><br />
  The site is https://cloudyforge.vercel.app/

  <br /><br />
  The "CloudyForge" site offers the user to buy and receive in the form of a photo/video of an inscription on an artillery, mortar shell, items that were purchased in the auction format.

  <br /><br />
  This contract is the official and public offer of the Seller to make a contract of purchase and sale of the Goods presented on the website:
  This contract is public, that is, in accordance with Article 633 of the Civil Code of Ukraine, its conditions are the same for all buyers regardless of their status (individual, legal entity, individual entrepreneur) without giving preference to one buyer over another. By concluding this Agreement, the buyer fully accepts the terms and conditions of placing an order, paying for the goods, delivering the goods, delivering the goods, responsibility for an unscrupulous order and all other terms of the contract. The contract is considered concluded from the moment the "Confirm Order" button is clicked on the order page and the Buyer receives an electronic confirmation of the order from the Seller.

  <br /><br />
  <strong className="block mb-2">1. Definition of terms</strong>

  1.1. Public offer (hereinafter - the "Offer") - a public offer of the Seller, addressed to an unspecified circle of persons, to enter into a contract with the Seller for the purchase and sale of goods or the exchange of charitable contributions for services remotely (hereinafter - the "Agreement") on the terms contained in this Offer.

  <br />
  1.2. The Product or Service is the object of the agreement of the parties, which was selected by the buyer on the website of the online store and purchased by the Buyer from the Seller remotely.

  <br />
  1.2. Online store - the Seller's website at the address:  is created for the conclusion of sales contracts based on the Buyer's familiarization with the description of the Goods or Services offered by the Seller via the Internet.

  <br />
  1.3. The buyer is a legally competent person who has reached the age of 18, receives information from the Seller, and places an order for the purchase of goods presented on the website of the online store.

  <br /><br />
  ------
  <br /><br />
  <strong className="block mb-2">3. Placement of the Order</strong>

  3.1. The buyer places an order in the online store on his own through the order form, or by placing an order by e-mail or at the phone number specified in the contact section of the online store.

  <br />
  3.2. The Seller has the right to refuse to transfer the order to the Buyer if the information provided by the Buyer during the order placement is incomplete or raises suspicions about its validity.

  <br />
  3.3. When placing an order on the website of the online store, the Buyer undertakes to provide the following mandatory information necessary for the Seller to fulfill the order:

  <br />
  3.3.1. last name, first name, the e-mail address of the Buyer;

  <br />
  3.3.2. order details;

  <br />
  3.3.3. contact phone;

  <br />
  3.3.4. full adress for delivery.

  <br />
  3.4. The name, quantity, and price of the Product or Service selected by the Buyer are specified immediately before the order on the website of the online store.

  <br />
  3.5. If any of the parties to the contract needs additional information, he has the right to request it from the other party. If the Buyer does not provide necessary or inaccurate information, the Seller is not responsible for providing quality service to the Buyer when purchasing goods in the online store.

  <br />
  3.6. The Buyer's acceptance of the terms of this Offer is carried out by entering the relevant data into the registration form on the website of the online store when placing the Order. After placing the Order, the Buyer's data is entered into the Seller's database.

  <br />
  3.7. The buyer is responsible for the accuracy of the information provided when placing the Order.

  <br />
  3.8. By concluding the Contract, i.e. by accepting the terms of this offer (the proposed terms of purchase of the Goods or Services), by placing the Order, the Buyer confirms the following:

  <br />
  a) The buyer is fully and completely acquainted with and agrees with the terms of this offer (offer);

  <br />
  b) he permits to collect, process and transfer of personal data, the agreement to process personal data is valid for the entire term of the Agreement, as well as for an unlimited period after its expiration. In addition, by concluding the contract, the Buyer confirms that he has been notified (without additional notification) of the rights established by the Law of Ukraine "On the Protection of Personal Data", the purposes of data collection, as well as the fact that his personal data are transferred to the Seller for the purpose of being able to fulfill the conditions of this Agreement, the possibility of mutual settlements, as well as for receiving invoices, deeds and other documents. The Buyer also agrees that the Seller has the right to provide access and transfer his personal data to third parties without any additional notifications from the Buyer for the purpose of fulfilling the Buyer's order. The extent of the Buyer's rights as a subject of personal data in accordance with the Law of Ukraine "On the Protection of Personal Data" is known and understood by him.

  <br /><br />
  <strong className="block mb-2">4. Price and Delivery of Goods or Services</strong>

  4.1. Prices for Goods and Services are determined by the Seller independently and are indicated on the website of the online store. All prices for goods and services are indicated on the website in US dollars.

  <br />
  4.2. Prices for Goods and Services may be changed by the Seller unilaterally depending on market conditions. At the same time, the price of a separate unit of Goods or Services, the cost of which has been paid in full by the Buyer, cannot be changed by the Seller unilaterally.

  <br />
  4.3. The Buyer's obligations to pay for the Goods or Services are considered fulfilled from the moment the funds are received by the Seller on his account.

  <br />
  4.4. The buyer who transfers funds automatically agrees that their funds may be used to support the Armed Forces of Ukraine.

  <br />
  4.5. By making the payment, the Buyer understands and agrees that the amount of the donation is non-refundable.

  <br /><br />
  <strong className="block mb-2">5. Rights and obligations of the Parties</strong>

  5.1. The seller is obliged to:
  <br />
  5.1.1. Provide the Buyer with Services in exchange for a payment for services and provide the Buyer with confirmation of the completed orders following the terms of this Agreement and the Buyer's order.
  <br />
  5.1.2. Not to disclose any private information about the Buyer and not to provide access to this information to third parties, except for cases provided by law and during the execution of the Buyer's Order.

  <br /><br />
  5.2. The seller has the right to:
  <br />
  5.2.1 Change the terms of this Agreement, as well as the prices of Goods and services, unilaterally, by posting them on the website of the Internet store. All changes take effect from the moment of their publication.

  <br /><br />
  5.3 The buyer undertakes:
  <br />
  5.3.1 Before concluding the Agreement, familiarize yourself with the content of the Agreement, the terms of the Agreement and the prices offered by the Seller on the website of the online store.
  <br />
  5.3.2 In order for the Seller to fulfill its obligations to the Buyer, the latter must provide all the necessary data that uniquely identifies him as the Buyer and are sufficient to provide the Buyer with Services.

  <br /><br />
  <strong className="block mb-2">7. Liability</strong>

  7.1. The Seller is not responsible for damage caused to the Buyer or third parties as a result of the use of the Services, or storage of the Goods purchased from the Seller.

  <br />
  7.2. The Seller is not responsible for improper, untimely fulfillment of Orders and its obligations if the Buyer provides inaccurate or erroneous information.

  <br />
  7.2.1 The Seller is not responsible for if during delivery the goods were lost or damaged due to events/situations that are not related to the Seller's error

  <br />
  7.3. The Seller and the Buyer are responsible for fulfilling their obligations following the current legislation of Ukraine and the provisions of this Agreement.

  <br />
  7.4. The Seller or the Buyer is released from responsibility for full or partial non-fulfillment of their obligations if the non-fulfillment is the result of force majeure circumstances such as war or hostilities, earthquake, flood, fire, and other natural disasters that occurred regardless of the will of the Seller and/or The buyer after concluding this contract. A Party that cannot fulfill its obligations shall immediately notify the other Party thereof.

  <br /><br />
  <strong className="block mb-2">8. Confidentiality and protection of personal data.</strong>

  8.1. By providing his personal data on the website of the online store when registering or placing an Order, the Buyer gives the Seller his voluntary consent to the processing, use (including the transfer) of his personal data, as well as taking other actions provided for by the Law of Ukraine "On the Protection of Personal Data ", without limiting the validity period of such consent.

  <br />
  8.2. The Seller undertakes not to disclose the information received from the Buyer. It is not considered a violation for the Seller to provide information to counterparties and third parties acting based on a contract with the Seller, including for the fulfillment of obligations to the Buyer, as well as in cases where the disclosure of such information is established by the requirements of the current legislation of Ukraine.

  <br />
  8.3. The buyer is responsible for keeping his personal data up to date. The Seller is not responsible for poor performance or failure to fulfill its obligations due to the irrelevance of information about the Buyer or its inconsistency.

  <br /><br />
  <strong className="block mb-2">9. Other conditions</strong>

  9.1. This contract is concluded on the territory of Ukraine and is valid following the current legislation of Ukraine.

  <br />
  9.2. All disputes arising between the Buyer and the Seller shall be resolved through negotiations. In case of failure to settle the disputed issue through negotiations, the Buyer and/or the Seller have the right to apply for a resolution of the dispute to the judicial authorities following the current legislation of Ukraine.

  <br />
  9.3. The seller has the right to make changes to this Agreement unilaterally, provided for in clause 5.2.1. Agreement. In addition, changes to the Agreement may also be made by mutual agreement of the Parties following the procedure provided for by the current legislation of Ukraine.
</p>

          </div>
        </div>
      )}

      {/* Основной контейнер регистрации */}
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-6 py-12">
        <div className="text-center -mt-64">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-lg">{t('subtitle')}</p>

          <form onSubmit={registerUser} className="mt-8 max-w-md mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder={t('usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Поле ввода пароля */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Image
                  src={showPassword ? '/hide.png' : '/show.png'}
                  alt={showPassword ? 'Hide password' : 'Show password'}
                  width={24}
                  height={24}
                />
              </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* Блок с чекбоксом и ссылкой (terms) */}
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agree" className="text-sm">
                I agree with 
                {' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-400 underline hover:text-blue-600"
                >
                  all terms
                </button>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('registerButton')}
            </button>
          </form>

          <p className="mt-4 text-sm">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              {t('loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
