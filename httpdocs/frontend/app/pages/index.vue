<script setup lang="ts">useHead({ title: 'Create free and dynamic QR codes' });</script>
<template>
  <div>
    <section class="border-base-content/10 bg-base-200/40 border-b">
      <div class="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div><span class="badge badge-primary badge-soft">Static QR codes stay free</span>
          <h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">One QR code tool you can understand in a minute.</h1>
          <p class="text-base-content/65 mt-4 max-w-xl text-lg">Create ordinary QR codes for free. Upgrade only when you need editable destinations, scan analytics and organized campaigns.</p>
          <div class="mt-6 flex flex-wrap gap-3"><a href="#generator" class="btn btn-primary">Create QR code<span class="icon-[tabler--arrow-down] size-4"/></a>
            <NuxtLink to="/pricing" class="btn btn-outline">See dynamic plans</NuxtLink>
          </div>
          <div class="text-base-content/60 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span><span class="icon-[tabler--check] text-success me-1 inline-block size-4"/>No account for static QR</span><span><span class="icon-[tabler--check] text-success me-1 inline-block size-4"/>PNG + SVG</span><span><span class="icon-[tabler--check] text-success me-1 inline-block size-4"/>Custom logos</span></div>
        </div>
        <div class="card bg-base-100 border-base-content/10 border shadow-sm">
          <div class="card-body p-5">
            <div class="mb-3 flex items-center justify-between"><span class="font-medium">Dynamic QR at a glance</span><span class="badge badge-success badge-soft">Active</span></div>
            <div class="grid grid-cols-3 gap-3">
              <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-xs">Scans</div>
                <div class="stat-value text-2xl">8.4k</div>
              </div>
              <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-xs">Countries</div>
                <div class="stat-value text-2xl">18</div>
              </div>
              <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-xs">QR codes</div>
                <div class="stat-value text-2xl">24</div>
              </div>
            </div>
            <AnalyticsMiniChart :values="[32,45,38,62,48,77,68,84,58,92,73,88,96,75]"/>
            <div class="alert alert-soft alert-info mt-2"><span class="icon-[tabler--bulb] size-5"/><span class="text-sm">Change a destination after printing. The QR image stays the same.</span></div>
          </div>
        </div>
      </div>
    </section>
    <QrGeneratorWorkspace/>
    <section id="how-it-works" class="bg-base-200/40 border-base-content/10 border-y">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><h2 class="text-2xl font-semibold">Static when simple is enough. Dynamic when the QR has a job.</h2>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <div class="card bg-base-100 border-base-content/10 border">
            <div class="card-body"><span class="icon-[tabler--qrcode] text-primary size-7"/>
              <h3 class="card-title text-base">Create</h3>
              <p class="text-base-content/60 text-sm">Website, Wi-Fi, contact, text, social, file and more.</p></div>
          </div>
          <div class="card bg-base-100 border-base-content/10 border">
            <div class="card-body"><span class="icon-[tabler--adjustments] text-primary size-7"/>
              <h3 class="card-title text-base">Manage</h3>
              <p class="text-base-content/60 text-sm">Rename, group, duplicate and reuse any saved QR as a template.</p></div>
          </div>
          <div class="card bg-base-100 border-base-content/10 border">
            <div class="card-body"><span class="icon-[tabler--chart-bar] text-primary size-7"/>
              <h3 class="card-title text-base">Learn</h3>
              <p class="text-base-content/60 text-sm">See scan trends, devices and countries for dynamic QR codes.</p></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>