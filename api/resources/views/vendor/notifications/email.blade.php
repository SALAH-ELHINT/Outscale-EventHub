<x-mail::message>
    <h1 class="text-2xl font-bold text-gray-900 mb-4">@lang('common.hello')</h1>

    @foreach ($introLines as $line)
        <p class="text-gray-700 mb-4">{{ $line }}</p>
    @endforeach

    @isset($actionText)
        <?php
            $color = match ($level) {
                'success' => 'bg-green-600 hover:bg-green-700',
                'error' => 'bg-red-600 hover:bg-red-700',
                default => 'bg-blue-600 hover:bg-blue-700',
            };
        ?>
        <div class="text-center mt-6">
            <a href="{{ $actionUrl }}" class="inline-block px-6 py-3 {{ $color }} text-white font-semibold rounded-lg shadow-md">
                {{ $actionText }}
            </a>
        </div>
    @endisset

    @foreach ($outroLines as $line)
        <p class="text-gray-700 mt-4">{{ $line }}</p>
    @endforeach

    @slot('footer')
        <div class="text-center text-gray-600 mt-8">
            <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    @endslot
</x-mail::message>
