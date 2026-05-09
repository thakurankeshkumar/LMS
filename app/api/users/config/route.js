import { requireAuth } from '@/lib/api-auth';
import Config from '@/lib/models/Config';

export async function GET(request) {
  try {
    const { response } = await requireAuth(['admin']);

    if (response) {
      return response;
    }

    let config = await Config.findOne();

    return new Response(JSON.stringify({ config }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    const { response } = await requireAuth(['admin']);

    if (response) {
      return response;
    }

    const { publicSignup } = await request.json();

    let config = await Config.findOne();

    if (!config) {
      config = new Config({ publicSignup });
    } else {
      config.publicSignup = publicSignup;
    }

    await config.save();

    return new Response(JSON.stringify({ message: 'Config updated successfully', config }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
