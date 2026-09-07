import 'flyonui/flyonui';

export default defineNuxtPlugin(() => {
    const router = useRouter();

    router.afterEach(() => {
        window.setTimeout(() => window.HSStaticMethods?.autoInit());
    });
});
