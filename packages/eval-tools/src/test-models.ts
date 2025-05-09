import { createAnthropic } from '@ai-sdk/anthropic'
import { AnthropicMessagesModelId } from '@ai-sdk/anthropic/internal'
import { createOpenAI } from '@ai-sdk/openai'
import { OpenAIChatModelId } from '@ai-sdk/openai/internal'
import { env } from 'cloudflare:test'
import { describe } from 'vitest'
import { createWorkersAI } from 'workers-ai-provider'

export const factualityModel = getOpenAiModel('gpt-4o')

type value2key<T, V> = {
	[K in keyof T]: T[K] extends V ? K : never
}[keyof T]
type AiTextGenerationModels = Exclude<
	value2key<AiModels, BaseAiTextGeneration>,
	value2key<AiModels, BaseAiTextToImage>
>

function getOpenAiModel(modelName: OpenAIChatModelId) {
	if (!env.OPENAI_API_KEY) {
		throw new Error('No API token set!')
	}
	const ai = createOpenAI({
		apiKey: env.OPENAI_API_KEY,
	})

	const model = ai(modelName)

	return { modelName, model, ai }
}

function getAnthropicModel(modelName: AnthropicMessagesModelId) {
	if (!env.ANTHROPIC_KEY) {
		throw new Error('No Anthropic key set!')
	}
	const ai = createAnthropic({
		apiKey: env.ANTHROPIC_KEY,
	})

	const model = ai(modelName)

	return { modelName, model, ai }
}

function getWorkersAiModel(modelName: AiTextGenerationModels) {
	if (!env.AI) {
		throw new Error('No AI binding provided!')
	}

	const ai = createWorkersAI({ binding: env.AI })

	const model = ai(modelName)
	return { modelName, model, ai }
}

export const eachModel = describe.each([
	getOpenAiModel('gpt-4o'),
	getOpenAiModel('gpt-4o-mini'),
	getAnthropicModel('claude-3-5-sonnet-latest'),
	// llama 3 is somewhat inconsistent
	//getWorkersAiModel("@cf/meta/llama-3.3-70b-instruct-fp8-fast")
	// Currently llama 4 is having issues with tool calling
	//getWorkersAiModel("@cf/meta/llama-4-scout-17b-16e-instruct")

	// TODO: add Claude, Gemini, new OpenAI models via AI gateway
])
