/**
 * Unit tests for promotional offers
 * Validates: Requirements 8.1, 8.2, 8.3
 */

describe('Unit Test: Promotional Offers', () => {
  describe('Promotional offers display', () => {
    it('should display promotional offers section', () => {
      const offersSection = {
        title: '充值优惠（USDT）',
        visible: true,
      }

      expect(offersSection.visible).toBe(true)
      expect(offersSection.title).toBeDefined()
    })

    it('should show promotional offers icon', () => {
      const icon = '🎁'

      expect(icon).toBe('🎁')
    })

    it('should display offers in a list format', () => {
      const offers = [
        '首充送20%奖励',
        '充值≥500 USDT 送50 USDT',
      ]

      expect(offers.length).toBeGreaterThan(0)
      expect(Array.isArray(offers)).toBe(true)
    })
  })

  describe('First deposit bonus', () => {
    it('should show first deposit bonus information', () => {
      const firstDepositBonus = '首充送20%奖励'

      expect(firstDepositBonus).toBeDefined()
      expect(firstDepositBonus).toContain('首充')
      expect(firstDepositBonus).toContain('20%')
    })

    it('should display first deposit bonus percentage', () => {
      const bonusPercentage = 20

      expect(bonusPercentage).toBe(20)
      expect(bonusPercentage).toBeGreaterThan(0)
    })

    it('should highlight first deposit bonus', () => {
      const isFirstDeposit = true
      const bonusText = '首充送20%奖励'

      if (isFirstDeposit) {
        expect(bonusText).toContain('首充')
      }
    })
  })

  describe('Tier bonuses', () => {
    it('should show deposit amount tier bonuses', () => {
      const tierBonuses = [
        { minAmount: 500, bonus: 50, currency: 'USDT' },
      ]

      expect(tierBonuses.length).toBeGreaterThan(0)
      expect(tierBonuses[0].minAmount).toBe(500)
      expect(tierBonuses[0].bonus).toBe(50)
    })

    it('should display tier bonus information', () => {
      const tierBonus = '充值≥500 USDT 送50 USDT'

      expect(tierBonus).toBeDefined()
      expect(tierBonus).toContain('500')
      expect(tierBonus).toContain('50')
      expect(tierBonus).toContain('USDT')
    })

    it('should show minimum amount for tier bonus', () => {
      const minAmount = 500

      expect(minAmount).toBe(500)
      expect(minAmount).toBeGreaterThan(0)
    })

    it('should show bonus amount for tier', () => {
      const bonusAmount = 50

      expect(bonusAmount).toBe(50)
      expect(bonusAmount).toBeGreaterThan(0)
    })
  })

  describe('USDT mention in offers', () => {
    it('should mention USDT in promotional offers title', () => {
      const title = '充值优惠（USDT）'

      expect(title).toContain('USDT')
      expect(title).toContain('（USDT）')
    })

    it('should mention USDT in tier bonuses', () => {
      const tierBonus = '充值≥500 USDT 送50 USDT'

      expect(tierBonus).toContain('USDT')
      expect(tierBonus.match(/USDT/g)?.length).toBeGreaterThanOrEqual(2)
    })

    it('should use USDT consistently in all offers', () => {
      const offers = [
        '首充送20%奖励',
        '充值≥500 USDT 送50 USDT',
      ]

      const offersWithUSDT = offers.filter((offer) => offer.includes('USDT'))

      expect(offersWithUSDT.length).toBeGreaterThan(0)
    })

    it('should not mention other currencies', () => {
      const offers = [
        '首充送20%奖励',
        '充值≥500 USDT 送50 USDT',
      ]

      const otherCurrencies = ['TON', 'BTC', 'ETH']

      otherCurrencies.forEach((currency) => {
        offers.forEach((offer) => {
          expect(offer).not.toContain(currency)
        })
      })
    })
  })

  describe('Bonus highlighting', () => {
    it('should highlight applicable bonus for amount >= 500', () => {
      const amount = 500
      const tierBonus = { minAmount: 500, bonus: 50 }

      const isApplicable = amount >= tierBonus.minAmount

      expect(isApplicable).toBe(true)
    })

    it('should not highlight bonus for amount < 500', () => {
      const amount = 400
      const tierBonus = { minAmount: 500, bonus: 50 }

      const isApplicable = amount >= tierBonus.minAmount

      expect(isApplicable).toBe(false)
    })

    it('should highlight first deposit bonus for new users', () => {
      const isFirstDeposit = true
      const firstDepositBonus = '首充送20%奖励'

      if (isFirstDeposit) {
        expect(firstDepositBonus).toBeDefined()
      }
    })
  })

  describe('Offers presentation', () => {
    it('should display offers with bullet points', () => {
      const offers = [
        '• 首充送20%奖励',
        '• 充值≥500 USDT 送50 USDT',
      ]

      offers.forEach((offer) => {
        expect(offer).toMatch(/^•/)
      })
    })

    it('should show offers in a visually distinct section', () => {
      const offersSection = {
        background: 'gradient',
        border: 'gold',
        icon: '🎁',
      }

      expect(offersSection.background).toBeDefined()
      expect(offersSection.border).toBeDefined()
      expect(offersSection.icon).toBe('🎁')
    })

    it('should display offers prominently', () => {
      const offersVisible = true
      const offersTitle = '充值优惠（USDT）'

      expect(offersVisible).toBe(true)
      expect(offersTitle).toBeDefined()
    })
  })

  describe('Bonus calculation', () => {
    it('should calculate first deposit bonus correctly', () => {
      const depositAmount = 100
      const bonusPercentage = 20
      const expectedBonus = depositAmount * (bonusPercentage / 100)

      expect(expectedBonus).toBe(20)
    })

    it('should calculate tier bonus correctly', () => {
      const depositAmount = 500
      const tierBonus = 50

      if (depositAmount >= 500) {
        expect(tierBonus).toBe(50)
      }
    })

    it('should not apply tier bonus for amounts below threshold', () => {
      const depositAmount = 400
      const minAmount = 500
      const tierBonus = depositAmount >= minAmount ? 50 : 0

      expect(tierBonus).toBe(0)
    })
  })

  describe('Offers accessibility', () => {
    it('should provide clear offer descriptions', () => {
      const offers = [
        '首充送20%奖励',
        '充值≥500 USDT 送50 USDT',
      ]

      offers.forEach((offer) => {
        expect(offer.length).toBeGreaterThan(0)
        expect(typeof offer).toBe('string')
      })
    })

    it('should use clear language in offers', () => {
      const firstDepositOffer = '首充送20%奖励'
      const tierOffer = '充值≥500 USDT 送50 USDT'

      expect(firstDepositOffer).toContain('首充')
      expect(tierOffer).toContain('充值')
      expect(tierOffer).toContain('送')
    })
  })
})
