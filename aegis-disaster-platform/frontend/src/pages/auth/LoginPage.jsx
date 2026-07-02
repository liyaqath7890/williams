import AuthForm from '../../components/forms/AuthForm';

export default function LoginPage() {
  return (
    <section className="px-6 py-16">
      <AuthForm mode="login" />
    </section>
  );
}
