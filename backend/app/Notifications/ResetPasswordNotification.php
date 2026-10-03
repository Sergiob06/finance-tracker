<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = sprintf(
            '%s/reset-password?token=%s&email=%s',
            rtrim(config('app.frontend_url'), '/'),
            $this->token,
            urlencode($notifiable->getEmailForPasswordReset()),
        );

        return (new MailMessage)
            ->subject('Recuperación de contraseña')
            ->line('Has recibido este correo porque hemos recibido una solicitud de recuperación de contraseña para tu cuenta.')
            ->action('Restablecer contraseña', $url)
            ->line('Este enlace de recuperación caducará en '.config('auth.passwords.users.expire').' minutos.')
            ->line('Si no has solicitado un cambio de contraseña, no es necesario que hagas nada más.');
    }
}
