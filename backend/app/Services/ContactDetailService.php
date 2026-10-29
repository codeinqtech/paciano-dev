
<?php

namespace App\Services;

use App\Models\ContactDetail;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactDetailService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = ContactDetail::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                    ->orWhere('value', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = min(
            max((int) ($filters['per_page'] ?? 10), 1),
            100
        );

        return $query
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function create(array $data): ContactDetail
    {
        return ContactDetail::create($data);
    }

    public function update(
        ContactDetail $contactDetail,
        array $data
    ): ContactDetail {
        $contactDetail->update($data);

        return $contactDetail->refresh();
    }

    public function delete(ContactDetail $contactDetail): void
    {
        $contactDetail->delete();
    }
}
