import {
	useActionData,
	useLocation,
	useNavigation,
	Form,
} from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Login() {
	let location = useLocation();
	let params = new URLSearchParams(location.search);
	let from = params.get('from') || '/';

	let navigation = useNavigation();
	let isLoggingIn =
		navigation.formData?.get('username') != null ||
		navigation.formData?.get('password') != null;

	let actionData = useActionData() as { error: string } | undefined;

	return (
		<div className="h-screen w-screen flex justify-end items-center bg-black">
			<div className=" flex flex-col flex-1 h-screen">
				<img
					src="landing-page.jpg"
					alt="receipt taking"
					className="object-cover h-full w-full"
				/>
			</div>
			<Form
				method="post"
				replace
				className="flex flex-col bg-dark text-white justify-center p-14 gap-2 w-[500px] h-screen"
			>
				<img src="demente-card.png" alt="demente" />
				<input type="hidden" name="redirectTo" value={from} />
				<label>
					Usuario: <Input className="text-black" name="username" />
				</label>
				<label>
					Contraseña:{' '}
					<Input type="password" className="text-black" name="password" />
				</label>
				<Button type="submit" disabled={isLoggingIn}>
					{isLoggingIn ? 'Logging in...' : 'Login'}
				</Button>
				{actionData && actionData.error ? (
					<div className="flex">
						<p className="w-full flex-0" style={{ color: 'red' }}>
							{actionData.error}
						</p>
					</div>
				) : null}
			</Form>
		</div>
	);
}
