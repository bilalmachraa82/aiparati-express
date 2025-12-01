import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PremiumUploadArea } from '../../app/components/PremiumUploadArea'
import { FormData } from '../../types/api'

// Mock framer-motion to avoid issues with testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('PremiumUploadArea', () => {
  const mockFormData: FormData = {
    nif: '',
    ano_exercicio: '',
    designacao_social: '',
    email: ''
  }

  const mockOnFormDataChange = jest.fn()
  const mockOnFileSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    expect(screen.getByText(/NIF/i)).toBeInTheDocument()
    expect(screen.getByText(/Ano de Exercício/i)).toBeInTheDocument()
    expect(screen.getByText(/Designação Social/i)).toBeInTheDocument()
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/Arraste e solte o PDF da IES/i)).toBeInTheDocument()
  })

  it('updates NIF field when typed in', async () => {
    const user = userEvent.setup()

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const nifInput = screen.getByPlaceholderText('123456789')
    await user.type(nifInput, '123456789')

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      nif: '123456789'
    })
  })

  it('updates year field when typed in', async () => {
    const user = userEvent.setup()

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const yearInput = screen.getByPlaceholderText('2023')
    await user.type(yearInput, '2023')

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      ano_exercicio: '2023'
    })
  })

  it('updates company name field when typed in', async () => {
    const user = userEvent.setup()

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const companyInput = screen.getByPlaceholderText('Empresa S.A.')
    await user.type(companyInput, 'Test Company')

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      designacao_social: 'Test Company'
    })
  })

  it('updates email field when typed in', async () => {
    const user = userEvent.setup()

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const emailInput = screen.getByPlaceholderText('empresa@exemplo.pt')
    await user.type(emailInput, 'test@example.com')

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      email: 'test@example.com'
    })
  })

  it('only allows numbers in NIF and year fields', async () => {
    const user = userEvent.setup()

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const nifInput = screen.getByPlaceholderText('123456789')
    const yearInput = screen.getByPlaceholderText('2023')

    await user.type(nifInput, 'abc123def')
    await user.type(yearInput, 'test2023')

    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      nif: '123'
    })
    expect(mockOnFormDataChange).toHaveBeenCalledWith({
      ...mockFormData,
      ano_exercicio: '2023'
    })
  })

  it('handles file selection correctly', async () => {
    const user = userEvent.setup()
    const validFormData: FormData = {
      nif: '123456789',
      ano_exercicio: '2023',
      designacao_social: 'Test Company',
      email: 'test@example.com'
    }

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    render(
      <PremiumUploadArea
        formData={validFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const fileInput = screen.getByLabelText(/Arraste e solte o PDF da IES/i)

    await user.upload(fileInput, file)

    expect(mockOnFileSelect).toHaveBeenCalledWith(file)
  })

  it('prevents file upload when form is invalid', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const fileInput = screen.getByLabelText(/Arraste e solte o PDF da IES/i)

    await user.upload(fileInput, file)

    expect(mockOnFileSelect).not.toHaveBeenCalled()
    expect(screen.getByText(/Preencha todos os campos primeiro/i)).toBeInTheDocument()
  })

  it('rejects non-PDF files', async () => {
    const user = userEvent.setup()
    const validFormData: FormData = {
      nif: '123456789',
      ano_exercicio: '2023',
      designacao_social: 'Test Company',
      email: 'test@example.com'
    }

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    render(
      <PremiumUploadArea
        formData={validFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    const fileInput = screen.getByLabelText(/Arraste e solte o PDF da IES/i)

    await user.upload(fileInput, file)

    expect(mockOnFileSelect).not.toHaveBeenCalled()
  })

  it('displays error message when provided', () => {
    const errorMessage = 'Test error message'

    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
        error={errorMessage}
      />
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('disables form inputs when uploading', () => {
    const validFormData: FormData = {
      nif: '123456789',
      ano_exercicio: '2023',
      designacao_social: 'Test Company',
      email: 'test@example.com'
    }

    render(
      <PremiumUploadArea
        formData={validFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={true}
      />
    )

    expect(screen.getByPlaceholderText('123456789')).toBeDisabled()
    expect(screen.getByPlaceholderText('2023')).toBeDisabled()
    expect(screen.getByPlaceholderText('Empresa S.A.')).toBeDisabled()
    expect(screen.getByPlaceholderText('empresa@exemplo.pt')).toBeDisabled()
  })

  it('shows upload progress when uploading', () => {
    const validFormData: FormData = {
      nif: '123456789',
      ano_exercicio: '2023',
      designacao_social: 'Test Company',
      email: 'test@example.com'
    }

    const uploadProgress = {
      percentage: 50,
      status: 'processing'
    }

    render(
      <PremiumUploadArea
        formData={validFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={() => {}} // Mock file select to set selectedFile
        isUploading={true}
        uploadProgress={uploadProgress}
      />
    )

    expect(screen.getByText(/A processar\.\.\./i)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows premium features banner', () => {
    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    expect(screen.getByText(/Processamento Premium Seguro/i)).toBeInTheDocument()
    expect(screen.getByText(/Extração por Claude 3\.5 Sonnet/i)).toBeInTheDocument()
  })

  it('displays help text for form fields', () => {
    render(
      <PremiumUploadArea
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
        onFileSelect={mockOnFileSelect}
        isUploading={false}
      />
    )

    expect(screen.getByText('9 dígitos')).toBeInTheDocument()
    expect(screen.getByText('Ano fiscal')).toBeInTheDocument()
  })
})