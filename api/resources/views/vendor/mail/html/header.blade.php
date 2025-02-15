@props(['url'])
<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block;">
            <div class="flex items-center justify-center">
                <img src="https://via.placeholder.com/150" alt="{{ config('app.name') }}" class="h-12 w-12 rounded-full">
                <span class="ml-3 text-xl font-bold text-gray-900">{{ config('app.name') }}</span>
            </div>
        </a>
    </td>
</tr>