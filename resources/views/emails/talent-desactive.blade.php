<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Compte désactivé</title>
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
                            <h2 style="color:#555; margin-top:0;">Compte désactivé</h2>
                            <p>Bonjour {{ $talent->prenom }},</p>
                            <p>Votre compte talent a été <strong>désactivé</strong> par un administrateur. Votre profil n'est plus visible par les clients sur la plateforme.</p>
                            <p>Si vous pensez qu'il s'agit d'une erreur, ou pour toute question, vous pouvez contacter notre support.</p>
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