import { expect } from 'vitest'
import { describeEval } from 'vitest-evals'

import { checkFactuality } from '@repo/eval-tools/src/scorers'
import { eachModel } from '@repo/eval-tools/src/test-models'

import { initializeClient, runTask } from './utils' // Assuming utils.ts will exist here

eachModel('$modelName', ({ model }) => {
	describeEval('KV Namespaces Tool Evaluations', {
		data: async () => [
			{
				input: 'Create a new Cloudflare KV Namespace called "my-test-namespace".',
				expected: 'The kv_namespaces_create tool should be called to create a new kv namespace.',
			},
			{
				input: 'List all my Cloudflare KV Namespaces.',
				expected:
					'The kv_namespaces_list tool should be called to retrieve the list of kv namespaces. There should be at least one kv namespace in the list.',
			},
			{
				input:
					'Rename my Cloudflare KV Namespace called "my-test-namespace" to "my-new-test-namespace".',
				expected: 'The kv_namespace_update tool should be called to rename the kv namespace.',
			},
			{
				input: 'Get details of my Cloudflare KV Namespace called "my-new-test-namespace".',
				expected:
					'The kv_namespace_get tool should be called to retrieve the details of the kv namespace.',
			},
			{
				input: 'Look up the id of my only KV namespace and delete it.',
				expected: 'The kv_namespace_delete tool should be called to delete the kv namespace.',
			},
		],
		task: async (input: string) => {
			const client = await initializeClient(/* Pass necessary mocks/config */)
			const { promptOutput, toolCalls, fullResult } = await runTask(client, model, input)

			if (input.includes('List all my Cloudflare KV Namespaces')) {
				console.log('fullResult', JSON.stringify(await fullResult.response, null, 2))
				const toolCall = toolCalls.find((call) => call.toolName === 'kv_namespaces_list')
				expect(toolCall, 'Tool kv_namespaces_list was not called').toBeDefined()
			}

			return promptOutput
		},
		scorers: [checkFactuality],
		threshold: 1,
		timeout: 60000, // 60 seconds
	})
})
