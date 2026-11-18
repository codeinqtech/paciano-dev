<?php

namespace App\Console\Commands;

use App\Services\GoogleBusinessReviewsSyncService;
use Illuminate\Console\Command;

class ImportGoogleBusinessStagingJsonCommand extends Command
{
    protected $signature = 'google-reviews:import-staging-json
                            {path? : Path to staging.json (repo root default)}
                            {--sync : After import, call live Business Profile sync if OAuth is connected}';

    protected $description = 'Import all reviews JSON blocks from staging.json, optionally run full API sync';

    public function handle(
        GoogleBusinessReviewsSyncService $sync,
        \App\Services\GoogleReviewsSyncService $coordinator,
    ): int {
        $path = $this->argument('path')
            ?? base_path('../staging.json');

        if (! is_string($path) || ! is_file($path)) {
            $this->error('File not found: '.$path);

            return self::FAILURE;
        }

        $contents = file_get_contents($path);
        if (! is_string($contents)) {
            $this->error('Could not read file.');

            return self::FAILURE;
        }

        $payloads = $this->extractReviewsPayloads($contents);
        if ($payloads === []) {
            $this->error('No reviews JSON object found in file.');

            return self::FAILURE;
        }

        $total = 0;
        foreach ($payloads as $index => $payload) {
            $result = $sync->importReviewsPayload($payload);
            if (! $result['success']) {
                $this->error('Block #'.($index + 1).': '.$result['message']);

                return self::FAILURE;
            }
            $count = (int) ($result['reviews_upserted'] ?? 0);
            $total += $count;
            $this->line('Block #'.($index + 1).': '.$result['message']);
        }

        $this->info("Imported {$total} review row(s) from ".count($payloads).' block(s).');

        if ($this->option('sync')) {
            $this->line('Running full Google Business Profile sync…');
            $syncResult = $coordinator->sync();
            $this->line($syncResult['message']);

            return $syncResult['success'] ? self::SUCCESS : self::FAILURE;
        }

        return self::SUCCESS;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function extractReviewsPayloads(string $contents): array
    {
        $payloads = [];
        $offset = 0;
        $len = strlen($contents);

        while ($offset < $len) {
            if (! preg_match(
                '/\{\s*"reviews"\s*:\s*\[/s',
                $contents,
                $match,
                PREG_OFFSET_CAPTURE,
                $offset,
            )) {
                break;
            }

            $start = $match[0][1];
            $slice = substr($contents, $start);
            $depth = 0;
            $end = null;
            $sliceLen = strlen($slice);

            for ($i = 0; $i < $sliceLen; $i++) {
                $char = $slice[$i];
                if ($char === '{') {
                    $depth++;
                } elseif ($char === '}') {
                    $depth--;
                    if ($depth === 0) {
                        $end = $i + 1;
                        break;
                    }
                }
            }

            if ($end === null) {
                break;
            }

            $json = substr($slice, 0, $end);
            $decoded = json_decode($json, true);
            if (is_array($decoded)) {
                $payloads[] = $decoded;
            }

            $offset = $start + $end;
        }

        return $payloads;
    }
}