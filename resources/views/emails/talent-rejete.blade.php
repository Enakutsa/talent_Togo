<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Profil non validé</title>
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
                            <h2 style="color:#c0392b; margin-top:0;">Profil non validé</h2>
                            <p>Bonjour {{ $talent->prenom }},</p>
                            <p>Après examen, votre profil talent n'a pas pu être validé pour le moment.</p>

                            @if($motif)
                                <table width="100%" cellpadding="12" style="background:#fdf2f0; border-left:4px solid #c0392b; border-radius:4px; margin:20px 0;">
                                    <tr>
                                        <td>
                                            <strong>Motif :</strong><br>
                                            {{ $motif }}
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            <p>Vous pouvez corriger les informations concernées et soumettre à nouveau votre profil.</p>

                            <p>
                                <a href="{{ url('/login') }}" style="background-color:#f0ad4e; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block;">
                                    Modifier mon profil
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