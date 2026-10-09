import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, AlertTriangle, Sparkles, HelpCircle, Lock, Award, CreditCard, Info } from 'lucide-react';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-14 border-b border-border pb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground block mb-2">
          Legal & Customer Policies
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl uppercase font-black tracking-tight mb-4 text-foreground">
          Terms & Conditions
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          H&S • Owned & Operated by ASaT (As Simple as That)
        </p>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-12 justify-center">
        {[
          { label: 'Brand & Fulfilment', href: '#brand' },
          { label: 'Shipping Policy', href: '#shipping' },
          { label: 'Return, Exchange & Refund', href: '#returns' },
          { label: 'Cancellation Policy', href: '#cancellation' },
          { label: 'Product Appearance', href: '#appearance' },
          { label: 'Complaints & Disputes', href: '#complaints' },
          { label: 'Privacy Policy', href: '#privacy' },
          { label: 'Intellectual Property', href: '#ip' },
          { label: 'Payment Policy', href: '#payment' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="space-y-14 text-sm leading-relaxed text-muted-foreground">

        {/* Section I */}
        <section id="brand" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <ShieldCheck className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              I. H&S Brand & Order Fulfilment Policy
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                1. How H&S Works
              </h3>
              <p className="mb-2">
                H&S is a fashion and lifestyle clothing brand owned by <strong className="text-foreground">ASaT (As Simple as That)</strong>.
              </p>
              <p className="mb-2">
                All products available on the H&S Website are designed, manufactured, quality checked, packaged, and fulfilled by H&S or its authorized partners.
              </p>
              <p className="mb-2">
                Products may be manufactured by H&S directly or through authorized third-party manufacturing partners that meet our quality standards.
              </p>
              <p>
                We manage the complete customer experience from product creation to delivery and customer support.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                2. Our Responsibilities
              </h3>
              <p className="mb-2">To provide a consistent and reliable shopping experience, H&S is responsible for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Designing and developing H&S products.</li>
                <li>Manufacturing products through approved production partners.</li>
                <li>Performing quality inspections before dispatch.</li>
                <li>Packaging and shipping customer orders.</li>
                <li>Providing order tracking and delivery updates.</li>
                <li>Handling customer support, complaints, exchanges, returns, and refunds according to our policies.</li>
                <li>Protecting customer payment information and maintaining a secure shopping experience.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                3. Customer Responsibilities
              </h3>
              <p className="mb-2">Customers are responsible for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Providing accurate personal, billing, and shipping information.</li>
                <li>Selecting the correct size, color, and product variant before placing an order.</li>
                <li>Reviewing the size chart and product information before purchase.</li>
                <li>Complying with these Terms & Conditions while using the H&S Website and services.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section II */}
        <section id="shipping" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <Truck className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              II. Shipping Policy
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                1. Order Delivery
              </h3>
              <p className="mb-2">
                We will arrange delivery of your order through the most suitable and reliable shipping partner available for your delivery location.
              </p>
              <p className="mb-2">
                Customers are responsible for providing a complete, accurate, and valid shipping address, along with the correct contact details, at the time of placing the order.
              </p>
              <p>
                We will not be responsible for delivery failures, delays, returns, exchanges, or refunds arising from incorrect, incomplete, or inaccurate shipping information provided by the customer.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                2. Order Tracking
              </h3>
              <p className="mb-2">
                Once your order has been shipped, We will provide the shipping partner's name and the tracking ID through the registered communication channel (such as Website, email, SMS, or WhatsApp, where applicable).
              </p>
              <p className="mb-2">
                Customers can use the provided tracking ID to monitor the delivery status directly on the shipping partner's tracking portal.
              </p>
              <p>
                Tracking information will be shared as soon as it becomes available after the order has been dispatched.
              </p>
            </div>

            <div className="bg-muted/40 border border-border p-4 rounded-sm">
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-black" />
                3. Unboxing Video (Crucial Requirement)
              </h3>
              <p className="mb-2">
                Customers are strongly advised to record a continuous, uninterrupted unboxing video from the moment the sealed package is opened until the product is fully displayed.
              </p>
              <p className="mb-2">
                The unboxing video serves as supporting evidence in case of complaints related to missing items, incorrect products, damaged products, or defective products.
              </p>
              <p>
                We may request the unboxing video while reviewing claims related to delivery or product issues.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                4. Shipping Delays
              </h3>
              <p className="mb-2">
                The estimated delivery time provided is only an approximation and should not be considered a guaranteed delivery date.
              </p>
              <p className="mb-2">
                Delivery may be delayed due to circumstances beyond our control, including but not limited to public holidays, weekends, adverse weather conditions, transportation disruptions, strikes, government restrictions, natural disasters, national or state emergencies, or other unforeseen events.
              </p>
              <p>
                We will make reasonable efforts to keep customers informed of any significant shipping delays whenever possible.
              </p>
            </div>
          </div>
        </section>

        {/* Section III */}
        <section id="returns" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <RotateCcw className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              III. Return, Exchange & Refund Policy
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-2 border-red-500 pl-4 py-1">
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                1. Non-Eligible Returns, Exchanges & Refunds
              </h3>
              <p className="mb-2">We do not accept returns, exchanges, or refunds for the following reasons:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The customer selected the wrong size while placing the order.</li>
                <li>The customer selected the wrong color or variant.</li>
                <li>The product color varies within the acceptable limits stated in the Product Appearance Policy.</li>
                <li>The customer did not like the product, its fit, style, or appearance.</li>
                <li>The product meets the specifications described on the Website and has no manufacturing defect or delivery issue.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                2. Exchange for Damaged or Defective Products
              </h3>
              <p className="mb-2">
                Exchanges will only be accepted if the product is received in a damaged, defective, or incorrect condition due to an error by us or during transit.
              </p>
              <p className="mb-2">
                Customers must raise a support ticket through the Website and provide the required supporting evidence, including an uninterrupted unboxing video recorded from the moment the sealed package is opened until the product is fully displayed.
              </p>
              <p className="mb-2">
                We reserve the right to inspect and verify the claim before approving an exchange.
              </p>
              <p>
                Claims submitted without sufficient supporting evidence may be rejected.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                3. Refund for Lost Packages
              </h3>
              <p className="mb-2">
                If an order is confirmed as lost in transit by the shipping partner and cannot be delivered to the customer, We will process a full refund or provide an alternative resolution at our discretion.
              </p>
              <p>
                Refunds for lost packages will be initiated only after confirmation from the respective shipping partner.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                4. Returns Due to Our Error
              </h3>
              <p className="mb-2">
                We will accept returns if the customer receives a product due to a genuine mistake on our part, including but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-2">
                <li>Delivery of an incorrect product.</li>
                <li>Delivery of an incorrect size or variant different from the customer's confirmed order.</li>
                <li>Delivery of a product with a verified manufacturing defect.</li>
              </ul>
              <p className="mb-2">
                Such requests are subject to verification and may require supporting evidence, including an uninterrupted unboxing video and photographs of the product.
              </p>
              <p>
                Upon successful verification, We will arrange the return and provide an appropriate replacement, exchange, or refund, as applicable.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                5. General Conditions
              </h3>
              <p className="mb-2">
                Products that have been worn, washed, altered, damaged after delivery, or returned without original tags and packaging are not eligible for return or exchange unless they have a verified manufacturing defect.
              </p>
              <p className="mb-2">
                All return, exchange, and refund requests are subject to review and approval by the Customer Support team.
              </p>
              <p>
                We reserve the right to reject any claim that is found to be false, fraudulent, unsupported by adequate evidence, or inconsistent with the policies stated above.
              </p>
            </div>
          </div>
        </section>

        {/* Section IV */}
        <section id="cancellation" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <AlertTriangle className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              IV. Cancellation Policy
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-sm text-foreground">
              <h3 className="font-bold uppercase tracking-wider text-xs mb-3 text-amber-900">
                1. Order Cancellation Timeline & Fees
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Within 36 Hours:</strong> Customers may request to cancel their order within 36 hours of successful payment. A <strong>50% cancellation fee</strong> will be deducted from the total order value, and the remaining amount will be refunded through the original payment method, subject to the applicable refund timeline.
                </li>
                <li>
                  <strong>Post 36 Hours:</strong> Once 36 hours have passed from the time of successful payment, the order will be considered confirmed. Any cancellation request made after this period will be subject to a <strong>100% cancellation fee</strong>, and no refund will be issued.
                </li>
              </ul>
            </div>
            <p>
              Cancellation requests must be sent by email to{' '}
              <a href="mailto:contact@assimpleasthat.shop" className="underline font-bold text-foreground hover:text-black">
                contact@assimpleasthat.shop
              </a>.
            </p>
          </div>
        </section>

        {/* Section V */}
        <section id="appearance" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              V. Product Appearance Policy
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                1. Product Image Variance
              </h3>
              <p className="mb-2">
                The product images displayed on the Website may include AI-generated model images or digitally enhanced visuals for presentation purposes.
              </p>
              <p>
                While every effort is made to accurately represent the product, the actual appearance, fit, drape, or styling of the product may vary slightly from the images shown on the Website.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                2. Color Variance
              </h3>
              <p className="mb-2">
                The actual color of the product may vary by up to 5% from the images displayed on the Website.
              </p>
              <p className="mb-2">
                Minor color variations may occur due to factors such as lighting conditions, camera settings, image processing, fabric dyeing, and differences in display settings across mobile devices, tablets, and computer monitors.
              </p>
              <p>
                Such minor color differences are standard within the apparel industry and shall not be considered a product defect.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                3. Size Variance
              </h3>
              <p className="mb-2">
                The measurements of the delivered product may vary by up to 5% from the published size chart.
              </p>
              <p className="mb-2">
                Minor size variations may occur due to the garment manufacturing process, including fabric characteristics, cutting, stitching and finishing.
              </p>
              <p>
                Such measurement differences are considered acceptable industry standards and shall not be treated as manufacturing defects or grounds for return, exchange, or refund.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                4. Clothing
              </h3>
              <p>
                Fabric texture, softness, GSM, print placement, and garment wash may vary slightly due to manufacturing processes and should not be considered defects if they remain within acceptable industry standards.
              </p>
            </div>
          </div>
        </section>

        {/* Section VI */}
        <section id="complaints" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <HelpCircle className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              VI. Complaint & Dispute Resolution Policy
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                1. Complaint Submission Process
              </h3>
              <p className="mb-2">
                Customers may submit complaints by email to{' '}
                <a href="mailto:contact@assimpleasthat.shop" className="underline font-bold text-foreground">
                  contact@assimpleasthat.shop
                </a>{' '}
                including the brand name, order ID, issue description, and customer details.
              </p>
              <p className="mb-2">
                Complaints related to refunds, exchanges, replacements, damaged products, defective products, incorrect products, incorrect size or variant, or missing items must be submitted within <strong>1-2 days</strong> of receiving the order. Requests submitted after this period may not be eligible for review or resolution, except where required under applicable law.
              </p>
              <p className="mb-2">
                To help us investigate and resolve complaints efficiently, customers may be requested to provide relevant supporting information, including order details, photographs, and an uninterrupted unboxing video, where applicable.
              </p>
              <p>
                Failure to provide the requested information within the required timeframe may affect our ability to process or resolve certain complaints.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
                2. Escalation Process
              </h3>
              <p className="mb-2">
                All complaints and support requests are handled by our Customer Support team with due care and attention.
              </p>
              <p className="mb-2">
                Our support team will review each case thoroughly and take appropriate action based on the nature of the issue and the information provided.
              </p>
              <p className="mb-2">
                If a complaint cannot be resolved during the initial review, it will be escalated to the appropriate team for further investigation and resolution.
              </p>
              <p>
                We are committed to resolving genuine customer concerns fairly, promptly, and in accordance with our applicable policies.
              </p>
            </div>
          </div>
        </section>

        {/* Section VII */}
        <section id="privacy" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <Lock className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              VII. Privacy Policy
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
              1. Information Collected & Protection
            </h3>
            <p className="mb-2">
              We collect the information necessary to process orders, provide customer support, improve our services, and enhance the overall shopping experience.
            </p>
            <p className="mb-2">
              Customer information may include details such as name, contact information, shipping and billing address, email address, phone number, and order history.
            </p>
            <p className="mb-2">
              We do not sell, rent, or share customers' personal information with any third-party organizations for their independent marketing or commercial purposes, except where required to fulfill orders (such as shipping partners, payment service providers) or where required by applicable law.
            </p>
            <p className="mb-2">
              Customer information may be used internally for business analytics, including understanding customer preferences, purchasing patterns, and sentiment analysis, to improve our products, services, and customer experience.
            </p>
            <p className="mb-2">
              We implement reasonable administrative, technical, and security measures to protect customer information against unauthorized access, misuse, alteration, or disclosure.
            </p>
            <p>
              By using our Website and services, customers consent to the collection and use of their information in accordance with this Privacy Policy.
            </p>
          </div>
        </section>

        {/* Section VIII */}
        <section id="ip" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <Award className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              VIII. Intellectual Property Policy
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
              1. Ownership of Intellectual Property
            </h3>
            <p className="mb-2">
              All H&S product designs, apparel graphics, prints, artwork, logos, brand names, trademarks, Website content, photographs, illustrations, digital assets, and creative materials are the exclusive intellectual property of H&S and ASaT.
            </p>
            <p className="mb-2">
              Every clothing design created, developed, or published by H&S is protected under applicable copyright, trademark, and intellectual property laws.
            </p>
            <p className="mb-2">
              No individual or organization may copy, reproduce, modify, manufacture, distribute, sell, or commercially exploit any H&S design, artwork, logo, print, or other intellectual property without prior written permission from H&S.
            </p>
            <p>
              Unauthorized use or imitation of H&S intellectual property may result in legal action under applicable laws.
            </p>
          </div>
        </section>

        {/* Section IX */}
        <section id="payment" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
            <CreditCard className="w-5 h-5 text-black" />
            <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
              IX. Payment Policy
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-xs text-foreground mb-2">
              1. Failed Payments
            </h3>
            <p className="mb-2">
              In the event of a payment failure, customers are advised to contact their respective payment service provider, bank, card issuer, or payment gateway for assistance regarding the transaction.
            </p>
            <p className="mb-2">
              Any refund arising from a failed or unsuccessful payment will be processed in accordance with the policies of the respective payment service provider or bank.
            </p>
            <p>
              We shall not be responsible for technical failures, transaction declines, payment processing errors, or delays caused by third-party payment gateways or financial institutions.
            </p>
          </div>
        </section>

        {/* Additional Note */}
        <section className="bg-muted/30 border border-border p-6 rounded-sm mt-12">
          <h3 className="font-heading font-bold uppercase tracking-wider text-sm text-foreground mb-2">
            Additional Note
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            H&S may update these Terms & Conditions from time to time at its sole discretion. Continued use of the H&S Website or services after any updates constitutes acceptance of the revised Terms & Conditions.
          </p>
        </section>

      </div>

      {/* Footer Return Link */}
      <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-muted-foreground transition-colors">
          &larr; Return to Shop
        </Link>
        <Link to="/help" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-muted-foreground transition-colors">
          Visit Help Center &rarr;
        </Link>
      </div>
    </div>
  );
}
