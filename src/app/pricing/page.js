import Footer from "@/components/Footer";
import { FaCheck, FaInfoCircle } from "react-icons/fa";

const PLANS = [
  { id: "basic", name: "Basic Pack", price: "$5", credits: 100, description: "Perfect for testing custom prompts and exploring styles." },
  { id: "standard", name: "Standard Pack", price: "$10", credits: 250, description: "Ideal for regular creators wanting high resolution outputs." },
  { id: "pro", name: "Professional Pack", price: "$20", credits: 600, description: "Designed for power users demanding batch exports and high speed.", popular: true },
  { id: "business", name: "Business Pack", price: "$50", credits: 2000, description: "Maximum value pack for agency workflows and large volume generations." }
];

export default function Pricing() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-page select-none text-primary-text overflow-hidden">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10 overflow-y-auto scrollbar-subtle items-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-1">
            <FaInfoCircle className="text-primary text-xs" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pricing Plans</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">Credit Packages</h1>
          <p className="text-xs sm:text-sm text-secondary-text max-w-lg leading-relaxed">
            Credit packages and online payments are coming soon. Use your own MuAPI key to generate videos in the meantime.
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Payments not enabled
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-bg-card border rounded-lg p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular ? "border-primary shadow-xl shadow-primary/5 scale-105" : "border-divider/50 shadow-md"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary-text">{plan.name}</h3>
                  <p className="text-2xl font-black tracking-tight text-white">{plan.price}</p>
                </div>
                
                <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded text-center font-extrabold text-primary">
                  {plan.credits} Art Credits
                </div>

                <p className="text-xs text-secondary-text leading-relaxed font-medium min-h-[3rem]">{plan.description}</p>
                
                <ul className="space-y-2 border-t border-divider/30 pt-4 text-xs font-semibold text-secondary-text">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-primary text-[10px]" />
                    <span>Dynamic aspect ratios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-primary text-[10px]" />
                    <span>HD image downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-primary text-[10px]" />
                    <span>No subscription required</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full border border-divider bg-bg-page/60 py-3 text-xs font-bold text-secondary-text opacity-70"
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
