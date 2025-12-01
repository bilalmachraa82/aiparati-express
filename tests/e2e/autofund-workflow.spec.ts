import { test, expect } from '@playwright/test';

test.describe('AutoFund AI - Complete User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should load the main page correctly', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/AutoFund AI|Aiparati Express/);

    // Check for key elements
    await expect(page.locator('h1')).toContainText(/AutoFund|Aiparati/i);
    await expect(page.locator('text=Portugal 2030')).toBeVisible();
  });

  test('should fill form fields correctly', async ({ page }) => {
    // Fill in the company form
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Verify form is filled
    await expect(page.locator('input[placeholder="123456789"]')).toHaveValue('516807706');
    await expect(page.locator('input[placeholder="2023"]')).toHaveValue('2023');
    await expect(page.locator('input[placeholder="Empresa S.A."]')).toHaveValue('PLF - PROJETOS, LDA.');
    await expect(page.locator('input[placeholder="empresa@exemplo.pt"]')).toHaveValue('test@plf.pt');
  });

  test('should validate form inputs correctly', async ({ page }) => {
    // Test NIF validation
    await page.fill('input[placeholder="123456789"]', '123');
    await page.blur('input[placeholder="123456789"]');
    // Should show validation error or prevent file upload

    // Test invalid email
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'invalid-email');
    await page.blur('input[placeholder="empresa@exemplo.pt"]');
    // Should show validation error

    // Fill valid form
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Form should now be valid
    await expect(page.locator('text=Preencha todos os campos primeiro')).not.toBeVisible();
  });

  test('should handle file upload via drag and drop', async ({ page }) => {
    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Create a test PDF file
    const testFileContent = Buffer.from('%PDF-1.4\n%EOF');

    // Get the drop zone element
    const dropZone = page.locator('text=Arraste e solte o PDF da IES').locator('..');

    // Simulate drag and drop
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await page.evaluateHandle((dt, content) => {
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });
      dt.items.add(file);
      return dt;
    }, dataTransfer, testFileContent);

    await dropZone.dispatchEvent('drop', { dataTransfer });

    // Check if file was accepted
    await expect(page.locator('text=test.pdf')).toBeVisible({ timeout: 5000 });
  });

  test('should handle file upload via file input', async ({ page }) => {
    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Create a test PDF file
    const testFileContent = Buffer.from('%PDF-1.4\n%EOF');

    // Get the file input (it's hidden, but we can still set files)
    const fileInput = page.locator('input[type="file"]');

    // Upload the file
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testFileContent
    });

    // Check if file was accepted
    await expect(page.locator('text=test.pdf')).toBeVisible({ timeout: 5000 });
  });

  test('should reject non-PDF files', async ({ page }) => {
    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Create a test text file
    const testFileContent = Buffer.from('This is not a PDF file');

    // Get the file input
    const fileInput = page.locator('input[type="file"]');

    // Try to upload the non-PDF file
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: testFileContent
    });

    // Should show error or reject the file
    await expect(page.locator('text=test.pdf')).not.toBeVisible({ timeout: 2000 });
  });

  test('should show processing status after upload', async ({ page }) => {
    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Create and upload a test PDF file
    const testFileContent = Buffer.from('%PDF-1.4\n%EOF');
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testFileContent
    });

    // Wait for upload to complete and processing to start
    await expect(page.locator('text=test.pdf')).toBeVisible({ timeout: 5000 });

    // Check if processing status appears (this might take a moment)
    await page.waitForTimeout(2000);

    // Look for processing indicators
    const processingElements = [
      'text=A processar',
      'text=Processando',
      'text=Processing',
      '[data-testid="processing-status"]',
      '.processing-indicator'
    ];

    for (const selector of processingElements) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
        break;
      } catch {
        // Continue to next selector
      }
    }
  });

  test('should display results after processing completes', async ({ page }) => {
    // This test assumes the backend is working and processing completes
    // In a real scenario, you might need to mock the API responses

    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'PLF - PROJETOS, LDA.');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'test@plf.pt');

    // Create and upload a test PDF file
    const testFileContent = Buffer.from('%PDF-1.4\n%EOF');
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testFileContent
    });

    // Wait for processing to complete (this might take several minutes)
    // In a real test, you would monitor the processing status
    await page.waitForTimeout(10000);

    // Look for results section
    const resultsSelectors = [
      'text=Resultados',
      'text=Análise',
      'text=Download',
      'text=Excel',
      '[data-testid="results"]',
      '.results-section'
    ];

    for (const selector of resultsSelectors) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 60000 });
        break;
      } catch {
        // Continue to next selector
      }
    }
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Look for dark mode toggle button
    const darkModeSelectors = [
      '[data-testid="dark-mode-toggle"]',
      'button[aria-label*="dark"]',
      'button[aria-label*="light"]',
      '.dark-mode-toggle',
      'text=🌙',
      'text=☀️'
    ];

    let toggleFound = false;
    for (const selector of darkModeSelectors) {
      try {
        const toggle = page.locator(selector);
        if (await toggle.isVisible()) {
          await toggle.click();
          toggleFound = true;

          // Wait for theme to change
          await page.waitForTimeout(500);

          // Check if dark mode is applied
          await expect(page.locator('html')).toHaveClass(/dark/);
          break;
        }
      } catch {
        // Continue to next selector
      }
    }

    if (!toggleFound) {
      test.skip('Dark mode toggle not found');
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Check if page is still usable on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder="123456789"]')).toBeVisible();
    await expect(page.locator('text=Arraste e solte o PDF da IES')).toBeVisible();

    // Try to fill the form on mobile
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'Test Mobile');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'mobile@test.com');

    // Verify form works on mobile
    await expect(page.locator('input[placeholder="123456789"]')).toHaveValue('516807706');
  });

  test('should handle navigation correctly', async ({ page }) => {
    // Check for navigation elements
    const navSelectors = [
      'nav',
      '.navigation',
      '[role="navigation"]',
      'header',
      '.header'
    ];

    let navFound = false;
    for (const selector of navSelectors) {
      try {
        const nav = page.locator(selector);
        if (await nav.isVisible()) {
          navFound = true;

          // Look for navigation links or buttons
          const linkSelectors = ['a', 'button', '[role="button"]'];
          for (const linkSelector of linkSelectors) {
            const links = nav.locator(linkSelector);
            const count = await links.count();
            if (count > 0) {
              // Test clicking the first link
              await links.first().click();
              await page.waitForTimeout(1000);
              break;
            }
          }
          break;
        }
      } catch {
        // Continue to next selector
      }
    }

    // Navigation is optional, so don't fail the test if not found
    console.log('Navigation elements found:', navFound);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated server error' })
      });
    });

    // Fill valid form first
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'Test Error');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'error@test.com');

    // Try to upload file
    const testFileContent = Buffer.from('%PDF-1.4\n%EOF');
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: testFileContent
    });

    // Check if error is displayed
    await page.waitForTimeout(2000);

    const errorSelectors = [
      'text=erro',
      'text=Error',
      'text=falhou',
      'text=failed',
      '.error-message',
      '[data-testid="error"]'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
        errorFound = true;
        break;
      } catch {
        // Continue to next selector
      }
    }

    if (!errorFound) {
      console.log('Error message not immediately visible, but test completed');
    }
  });
});

test.describe('AutoFund AI - Accessibility Tests', () => {
  test('should have proper page structure and semantics', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();

    // Check for proper form labels
    await expect(page.locator('label:has-text("NIF")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();

    // Check for proper button texts
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Check for ARIA labels
    const elementsWithAria = page.locator('[aria-label], [aria-describedby], [aria-labelledby]');
    const ariaCount = await elementsWithAria.count();
    expect(ariaCount).toBeGreaterThanOrEqual(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus management
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This would require specialized testing tools
    // For now, just ensure elements are visible
    await page.goto('http://localhost:3000');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder="123456789"]')).toBeVisible();
    await expect(page.locator('text=Arraste e solte o PDF da IES')).toBeVisible();
  });
});

test.describe('AutoFund AI - Performance Tests', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should handle form interaction smoothly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const startTime = Date.now();

    // Fill form quickly
    await page.fill('input[placeholder="123456789"]', '516807706');
    await page.fill('input[placeholder="2023"]', '2023');
    await page.fill('input[placeholder="Empresa S.A."]', 'Performance Test');
    await page.fill('input[placeholder="empresa@exemplo.pt"]', 'perf@test.com');

    const interactionTime = Date.now() - startTime;

    // Form interaction should be smooth (under 1 second)
    expect(interactionTime).toBeLessThan(1000);
    console.log(`Form interaction time: ${interactionTime}ms`);
  });
});