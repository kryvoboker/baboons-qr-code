<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Вход</title></head>
<body>
<main style="max-width:28rem;margin:4rem auto;font-family:sans-serif">
    <h1>Вход в аккаунт</h1>
    @if ($errors->any()) <p style="color:#b91c1c">{{ $errors->first() }}</p> @endif
    <form method="POST" action="{{ route('login.store') }}">
        @csrf
        <input type="hidden" name="redirect" value="{{ $redirect }}">
        <p><label>Email<br><input name="email" type="email" value="{{ old('email') }}" required autofocus></label></p>
        <p><label>Пароль<br><input name="password" type="password" required></label></p>
        <button type="submit">Войти</button>
    </form>
</main>
</body>
</html>
