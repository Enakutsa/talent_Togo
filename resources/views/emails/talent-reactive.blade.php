<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Compte réactivé</title>
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
                        <td style="padding:30px;">
                            <h2 style="color:#1e7e34; margin-top:0;">Bonne nouvelle {{ $talent->prenom }} 🎉</h2>
                            <p>Votre compte talent a été <strong style="color:#1e7e34;">réactivé</strong> par un administrateur.</p>
                            <p>Vous êtes de nouveau visible par les clients sur TalentTogo et pouvez recevoir des demandes de prestation.</p>

                            <p>
                                <a href="{{ url('/login') }}" style="background-color:#1e7e34; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block;">
                                    Accéder à mon compte
                                </a>
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