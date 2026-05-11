<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    public function test_guest_can_view_home_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
    }

    public function test_guest_can_view_about_page(): void
    {
        $response = $this->get(route('about'));

        $response->assertOk();
    }
}
