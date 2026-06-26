<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Nouveau talent en attente</title>
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
                            <h2 style="color:#1e7e34; margin-top:0;">Nouveau talent en attente de validation</h2>
                            <p>Un nouveau talent vient de s'inscrire sur la plateforme et attend votre validation.</p>

                            <table width="100%" cellpadding="8" style="background:#f9f9f6; border-radius:6px; margin:20px 0;">
                                <tr>
                                    <td><strong>Nom :</strong></td>
                                    <td>{{ $talent->prenom }} {{ $talent->nom }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email :</strong></td>
                                    <td>{{ $talent->email }}</td>
                                </tr>
                                <tr>
                                    <td><strong>Téléphone :</strong></td>
                                    <td>{{ $talent->telephone }}</td>
                                </tr>
                            </table>

                            <p>
                                <a href="{{ url('/admin') }}" style="background-color:#f0ad4e; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block;">
                                    Voir dans l'admin
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