<x-mail::layout>
    {{-- Header --}}
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    {{-- Body --}}
    <div class="bg-white p-6 rounded-lg shadow-lg">
        {{-- Greeting --}}
        <h1 class="text-2xl font-bold text-gray-900 mb-4">@lang('common.hello')</h1>

        {{-- Intro Lines --}}
        @foreach ($introLines as $line)
            <p class="text-gray-700 mb-4">{{ $line }}</p>
        @endforeach

        {{-- Action Button --}}
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

        {{-- Outro Lines --}}
        @foreach ($outroLines as $line)
            <p class="text-gray-700 mt-4">{{ $line }}</p>
        @endforeach
    </div>

    {{-- Subcopy --}}
    @isset($subcopy)
        <x-slot:subcopy>
            <x-mail::subcopy>
                {{ $subcopy }}
            </x-mail::subcopy>
        </x-slot:subcopy>
    @endisset

    {{-- Footer --}}
    <x-slot:footer>
        <x-mail::footer>
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>