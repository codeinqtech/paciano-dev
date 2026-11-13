<?php

namespace App\Services;

use App\Models\ContactDetail;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactDetailService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ContactDetail::query();

        // Search
        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(
                min(max((int) ($filters['per_page'] ?? 15), 1), 100)
            );
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

        return $contactDetail->fresh();
    }

    public function delete(ContactDetail $contactDetail): bool
    {
        return $contactDetail->delete();
    }
}
