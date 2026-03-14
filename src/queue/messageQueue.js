const queue = []

let processing = false

export function addToQueue(task) {

  queue.push(task)

  processQueue()

}

async function processQueue() {

  if (processing) return

  processing = true

  while (queue.length > 0) {

    const job = queue.shift()

    try {

      await job()

    } catch (err) {

      console.log("Queue error:", err.message)

    }

    await new Promise(r => setTimeout(r, 2000))

  }

  processing = false

}
