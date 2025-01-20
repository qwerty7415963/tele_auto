import { Builder, By, until } from 'selenium-webdriver'
import 'chromedriver'
import * as cheerio from 'cheerio'

export const getForexFactoryData = async () => {
  const driver = await new Builder().forBrowser('chrome').build()

  const events = []
  // Navigate to the website
  await driver.get('https://www.forexfactory.com/calendar?day=today')

  // Get the page source from Selenium
  const pageSource = await driver.getPageSource()

  // Load the HTML into Cheerio
  const $ = cheerio.load(pageSource)

  // Select all tr elements inside tbody that have data-event-id attribute
  const rows = $('tbody tr[data-event-id]')
  rows.each((index, element) => {
    const currency = $(element).find('.calendar__currency').text().trim()
    const impact = $(element)
      .find('.calendar__cell.calendar__impact span.icon')
      .attr('title')
    const event = $(element).find('.calendar__event').text().trim()
    const actual = $(element).find('.calendar__actual').text().trim()
    const forecast = $(element).find('.calendar__forecast').text().trim()
    if (currency === 'USD' && impact === 'High Impact Expected') {
      events.push({
        event,
        actual,
        forecast,
      })
    }
  })

  await driver.quit()

  return events
}
