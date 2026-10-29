
<?php

namespace App\Services;

use App\Models\ContactPageContent;

class ContactPageService
{
    public function getContent(): ContactPageContent
    {
        return ContactPageContent::firstOrCreate(
            ['id' => 1]
        );
    }

    public function update(array $data): ContactPageContent
    {
        $content = $this->getContent();

        $content->update($data);

        return $content->refresh();
    }
}
