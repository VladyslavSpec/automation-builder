const PLANS = [
  {
    name: 'Free',
    price: '$0/mo',
    planKey: 'free',
    color: '#64748b',
    features: ['3 workflows', '100 runs/month', 'Community support'],
  },
  {
    name: 'Solo',
    price: '$12/mo',
    planKey: 'solo',
    color: '#6366f1',
    features: ['20 workflows', '2,000 runs/month', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$39/mo',
    planKey: 'pro',
    color: '#a855f7',
    features: ['Unlimited workflows', '20,000 runs/month', 'Priority support', 'Webhooks'],
  },
  {
    name: 'Agency',
    price: '$99/mo',
    planKey: 'agency',
    color: '#f59e0b',
    features: ['Everything in Pro', 'Multi-user', 'Custom branding', 'SLA'],
  },
];

export default function PlansPanel({ user }) {
  const currentPlan = user?.plan || 'free';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #ffffff10', flexShrink: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>Plans & Billing</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>Stripe coming soon</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.planKey;
          return (
            <div
              key={plan.planKey}
              style={{
                marginBottom: 10, padding: '12px', borderRadius: 8,
                background: isCurrent ? plan.color + '12' : '#ffffff06',
                border: `1px solid ${isCurrent ? plan.color + '40' : '#ffffff10'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: plan.color }}>{plan.name}</span>
                  {isCurrent && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: plan.color, background: plan.color + '20',
                      padding: '1px 5px', borderRadius: 8, textTransform: 'uppercase',
                    }}>Current</span>
                  )}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{plan.price}</span>
              </div>

              <ul style={{ margin: 0, paddingLeft: 14, listStyle: 'none' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: plan.color, fontSize: 10 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <button
                  disabled
                  style={{
                    marginTop: 10, width: '100%', background: plan.color + '20',
                    border: `1px solid ${plan.color}40`, borderRadius: 5,
                    color: plan.color, fontSize: 11, fontWeight: 600, padding: '5px',
                    cursor: 'not-allowed', opacity: 0.6,
                  }}
                  title="Coming soon"
                >
                  Upgrade — Coming Soon
                </button>
              )}
            </div>
          );
        })}

        <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', paddingBottom: 8 }}>
          Payments via Stripe — coming soon
        </div>
      </div>
    </div>
  );
}
