export default defineNuxtConfig({
	compatibilityDate: '2025-07-14',

	ssr: false,

	modules: ['@nuxt/ui'],

	css: ['~/assets/css/main.css'],

	nitro: {
		experimental: {
			database: true,
		},
		database: {
			default: {
				connector: 'sqlite',
				options: { name: 'notes' },
			},
		},
	},
})
