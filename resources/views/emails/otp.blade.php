<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Code OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f0; font-family: Arial, sans-serif; color:#222;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
        <tr>
            <td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                    <tr>
                        <td style="background-color:#1e7e34; padding:20px 30px;">
                            <span style="color:#ffffff; font-size:20px; font-weight:bold;">
                                Talent<span style="color:#f0ad4e;">Togo</span>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; text-align:center;">
                            <h2 style="color:#1e7e34; margin-top:0;">Votre code de vérification</h2>
                            <p>Utilisez ce code pour vous connecter (valide 10 minutes) :</p>

                            <div style="font-size:32px; font-weight:bold; letter-spacing:8px; background:#f9f9f6; padding:20px; border-radius:8px; margin:20px 0; color:#1e7e34;">
                                {{ $code }}
                            </div>

                            <p style="color:#888; font-size:13px;">
                                Si vous n'avez pas demandé ce code, ignorez cet email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 30px; background:#f4f4f0; font-size:12px; color:#888;">
                            TalentTogo — Plateforme de mise en relation talents & clients au Togo
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>