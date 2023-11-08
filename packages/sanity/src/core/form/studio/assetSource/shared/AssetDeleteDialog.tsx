import React, {useMemo} from 'react'
import {TrashIcon} from '@sanity/icons'
import {Box, Button, Dialog, Grid, Stack} from '@sanity/ui'
import {Asset as AssetType} from '@sanity/types'
import {SpinnerWithText} from '../../../components/SpinnerWithText'
import {useReferringDocuments} from '../../../../hooks/useReferringDocuments'
import {AssetUsageList} from './AssetUsageList'
import {ConfirmMessage} from './ConfirmMessage'

export interface UsageDialogProps {
  assetType: 'file' | 'image'
  asset: AssetType
  isDeleting?: boolean
  onClose: () => void
  onDelete: () => void
}

export function AssetDeleteDialog({
  asset,
  assetType,
  isDeleting = false,
  onClose,
  onDelete,
}: UsageDialogProps) {
  const {isLoading, referringDocuments} = useReferringDocuments(asset._id)

  const publishedDocuments = useMemo(() => {
    const drafts = referringDocuments.reduce<string[]>(
      (acc, doc) => (doc._id.startsWith('drafts.') ? acc.concat(doc._id.slice(7)) : acc),
      [],
    )

    return referringDocuments.filter((doc) => !drafts.includes(doc._id))
  }, [referringDocuments])

  const hasResults = publishedDocuments.length > 0

  const footer = useMemo(
    () => (
      <Grid padding={2} gap={2} columns={2}>
        <Button mode="bleed" text="Cancel" onClick={onClose} />
        <Button
          text="Delete"
          tone="critical"
          icon={TrashIcon}
          onClick={onDelete}
          loading={isDeleting}
          disabled={hasResults}
        />
      </Grid>
    ),
    [hasResults, isDeleting, onClose, onDelete],
  )

  return (
    <Dialog
      __unstable_autoFocus={isLoading}
      footer={footer}
      header={`Delete ${assetType}`}
      id="asset-dialog"
      onClickOutside={onClose}
      onClose={onClose}
      width={1}
    >
      {isLoading ? (
        <Box padding={4}>
          <SpinnerWithText text="Loading" />
        </Box>
      ) : (
        <Stack
          paddingX={hasResults ? [2, 3, 4] : 0}
          paddingY={hasResults ? [3, 3, 3, 4] : 0}
          space={1}
        >
          <ConfirmMessage asset={asset} assetType={assetType} hasResults={hasResults} />

          {hasResults && (
            <AssetUsageList
              asset={asset}
              referringDocuments={publishedDocuments}
              assetType={assetType}
            />
          )}
        </Stack>
      )}
    </Dialog>
  )
}