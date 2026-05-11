import { requireAuth } from '@/lib/api-auth';
import Config from '@/lib/models/Config';
import dbConnect from '@/lib/db/mongodb';

function serializeConfig(config) {
  return {
    publicSignup: config?.publicSignup ?? true,
    maintenanceMode: config?.maintenanceMode ?? false,
    signupNotice: config?.signupNotice ?? '',
    supportEmail: config?.supportEmail ?? '',
    defaultTestDuration: config?.defaultTestDuration ?? 30,
    defaultPassingPercentage: config?.defaultPassingPercentage ?? 40,
    defaultNegativeMarking: config?.defaultNegativeMarking ?? false,
    studentAnswerReviewEnabled: config?.studentAnswerReviewEnabled ?? true,
  };
}

export async function GET(request) {
  try {
    await dbConnect();

    const config = await Config.findOne();
    const publicConfig = serializeConfig(config);

    return new Response(JSON.stringify({ config: publicConfig }), {
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

    const body = await request.json();

    let config = await Config.findOne();

    if (!config) {
      config = new Config();
    }

    const booleanFields = ['publicSignup', 'maintenanceMode', 'defaultNegativeMarking', 'studentAnswerReviewEnabled'];
    booleanFields.forEach((field) => {
      if (body[field] !== undefined) config[field] = Boolean(body[field]);
    });

    if (body.signupNotice !== undefined) config.signupNotice = String(body.signupNotice).slice(0, 240);
    if (body.supportEmail !== undefined) config.supportEmail = String(body.supportEmail).trim();

    if (body.defaultTestDuration !== undefined) {
      const duration = Number(body.defaultTestDuration);
      if (!Number.isNaN(duration)) config.defaultTestDuration = Math.min(480, Math.max(1, duration));
    }

    if (body.defaultPassingPercentage !== undefined) {
      const passing = Number(body.defaultPassingPercentage);
      if (!Number.isNaN(passing)) config.defaultPassingPercentage = Math.min(100, Math.max(0, passing));
    }

    await config.save();

    return new Response(JSON.stringify({ message: 'Config updated successfully', config: serializeConfig(config) }), {
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
