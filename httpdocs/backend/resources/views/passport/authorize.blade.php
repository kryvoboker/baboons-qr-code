<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Разрешение доступа</title></head>
<body>
<main style="max-width:36rem;margin:4rem auto;font-family:sans-serif">
    <h1>Разрешить доступ?</h1>
    <p>Приложение <strong>{{ $client->name }}</strong> запрашивает доступ к вашему аккаунту.</p>
    <p>Пользователь: {{ $user->email }}</p>
    <form method="POST" action="{{ route('passport.authorizations.approve') }}" style="display:inline">
        @csrf
        <input type="hidden" name="state" value="{{ $request->session()->token() }}">
        <input type="hidden" name="auth_token" value="{{ $authToken }}">
        <button type="submit">Разрешить</button>
    </form>
    <form method="POST" action="{{ route('passport.authorizations.deny') }}" style="display:inline">
        @csrf
        <input type="hidden" name="state" value="{{ $request->session()->token() }}">
        <input type="hidden" name="auth_token" value="{{ $authToken }}">
        <button type="submit">Отмена</button>
    </form>
</main>
</body>
</html>
