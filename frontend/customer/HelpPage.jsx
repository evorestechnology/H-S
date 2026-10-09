import { Link } from 'react-router-dom';

export default function HelpPage() {
  const faqSections = [
    {
      title: "Order Cancellation",
      faqs: [
        {
          q: "1.1 Can I cancel my order after making the payment?",
          a: "Yes. You can cancel your order within 36 hours from the time you placed it.\n\nWithin 36 hours: 50% cancellation fee will be charged and the remaining amount will be refunded.\nAfter 36 hours: The order can be cancelled but a 100% cancellation fee applies (no refund)."
        },
        {
          q: "1.2 Can H&S cancel my order?",
          a: "Yes. H&S reserves the right to cancel an order in exceptional situations, such as:\n- Strikes or unforeseen disruptions.\n- Lockdowns or government restrictions.\n- Delivery partner unavailability.\n- Any other situation that prevents us from delivering your order.\n\nIn such cases, you will receive a 100% refund of the amount you paid."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      faqs: [
        {
          q: "2.1 Can I exchange my product if I don't like the color, item, or size ordered?",
          a: "No. We follow a strict no return and no exchange policy for products that have been successfully delivered.\nPlease check the product details, color, and size carefully before placing your order."
        },
        {
          q: "2.2 Can I return or get a refund if H&S sends the wrong item, color, or size?",
          a: "Yes. If the mistake is from H&S, we will provide a 100% refund after verifying the issue.\n\nTo process your request:\n- Record a continuous, uninterrupted unboxing video from the moment you open the package.\n- Email the video to our customer support email along with your order details.\n- Once our team successfully verifies the issue, we will arrange the return and initiate a 100% refund."
        }
      ]
    },
    {
      title: "Shipping",
      faqs: [
        {
          q: "3.1 How long does shipping take?",
          a: "Our estimated shipping times are:\nIndia (Domestic) : 7–8 working days\nInternational : 14 working days\n\nThese are approximate delivery timelines and may vary depending on your location and logistic situations."
        }
      ]
    },
    {
      title: "Contact Us",
      faqs: [
        {
          q: "4.1 How can I contact H&S Customer Support?",
          a: "You can contact our customer support team by sending an email to contact@assimpleasthat.shop.\n\nPlease include the following details in your email:\n- Customer Name\n- Phone Number\n- Order ID (if available)\n- Description of the issue\n- Photos or videos (if required, e.g. unboxing video)\n\nOur support team will get back to you as quickly as possible."
        }
      ]
    }
  ];

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 min-h-screen">
      <h1 className="font-heading text-4xl uppercase font-bold mb-12 text-center">Help Center</h1>
      
      <div className="space-y-12">
        {faqSections.map((section, idx) => (
          <div key={idx}>
            <h2 className="font-heading text-2xl uppercase font-bold mb-6 border-b border-border pb-2">
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.faqs.map((faq, i) => (
                <div key={i} className="border border-border p-6 bg-muted/20">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center border-t border-border pt-12 space-y-4">
        <p className="text-sm uppercase tracking-widest mb-4">Still need help?</p>
        <div>
          <a 
            href="mailto:contact@assimpleasthat.shop"
            className="inline-block px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-sm hover:bg-black/80 transition-colors"
          >
            Contact Support
          </a>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest pt-4">
          For full policies, please review our{' '}
          <Link to="/terms" className="underline font-bold text-foreground hover:text-black">
            Terms & Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
