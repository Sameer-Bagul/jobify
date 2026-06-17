export default function FAQ() {
    const faqs = [
        {
            question: "How does the email automation work?",
            answer: "We connect to your email provider and send highly personalized, research-backed sequences to recruiters. Each email is unique and includes your tailored resume."
        },
        {
            question: "Is it safe for my email reputation?",
            answer: "Yes! We use advanced 'warming' techniques and spread out your emails to ensure high deliverability and protect your account from being flagged."
        },
        {
            question: "Can I use Jobify as a recruiter?",
            answer: "Absolutely. Recruiters can post jobs, manage candidates, and use our smart-matching to find the best talent match for their open roles."
        }
    ];

    return (
        <section className="pb-24 max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 font-outfit text-dark-walnut">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="card glass-card">
                        <h4 className="text-lg font-bold text-dark-walnut mb-2">{faq.question}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
