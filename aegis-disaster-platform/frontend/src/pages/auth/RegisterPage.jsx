import AuthForm from '../../components/forms/AuthForm';

export default function RegisterPage() {
  return (
    <section className="px-6 py-16">
      <AuthForm mode="register" />
    </section>
  );
}
