<div style="position:relative;overflow:hidden;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:#18181b;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(245,158,11,0.12), transparent 60%);pointer-events:none;"></div>
    <div style="position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:9999px;background:rgba(245,158,11,0.15);filter:blur(50px);pointer-events:none;"></div>
    <div style="position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding:24px;">
        <div style="display:flex;align-items:center;gap:16px;">
            <div style="flex-shrink:0;width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg, #fbbf24, #d97706);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;box-shadow:0 8px 20px rgba(217,119,6,0.35);">
                T
            </div>
            <div>
                <p style="margin:0 0 2px 0;font-size:13px;font-weight:600;color:#fbbf24;">
                    {{ now()->translatedFormat('l d F Y') }}
                </p>
                <h2 style="margin:0;font-size:22px;font-weight:700;color:#fff;">
                    {{ $this->getGreeting() }}, {{ $this->getAdminName() }} 👋
                </h2>
                <p style="margin:4px 0 0 0;font-size:13px;color:#9ca3af;">
                    Voici ce qui se passe sur TalentTogo aujourd'hui.
                </p>
            </div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
            <a href="{{ url('/') }}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);padding:8px 16px;font-size:13px;font-weight:600;color:#e5e7eb;text-decoration:none;">
                Voir le site
            </a>
            <button type="button" wire:click="logout" style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;border:none;background:#fff;padding:8px 16px;font-size:13px;font-weight:600;color:#18181b;cursor:pointer;">
                Déconnexion
            </button>
        </div>
    </div>
</div>